using Azure;
using Azure.AI.OpenAI;
using Azure.Identity;

namespace api.Services;

public abstract class PoolEntry
{
    private long _rateLimitedUntilTicks;

    public bool IsAvailable => DateTime.UtcNow.Ticks >= Interlocked.Read(ref _rateLimitedUntilTicks);

    public void MarkRateLimited(int retryAfterSeconds = 60)
        => Interlocked.Exchange(ref _rateLimitedUntilTicks,
            DateTime.UtcNow.AddSeconds(retryAfterSeconds).Ticks);

    public int GetRetryAfterSeconds()
    {
        var until = new DateTime(Interlocked.Read(ref _rateLimitedUntilTicks), DateTimeKind.Utc);
        var s = (until - DateTime.UtcNow).TotalSeconds;
        return s > 0 ? (int)Math.Ceiling(s) : 0;
    }
}

public class FoundryEntry : PoolEntry
{
    public string Url { get; init; } = "";
    public string Key { get; init; } = "";
    public string TenantId { get; init; } = "";

    private AzureOpenAIClient? _client;
    public AzureOpenAIClient GetOrCreateClient()
    {
        if (_client is not null) return _client;
        AzureOpenAIClient created;
        if (!string.IsNullOrEmpty(Key))
            created = new AzureOpenAIClient(new Uri(Url), new AzureKeyCredential(Key));
        else
        {
            var credential = string.IsNullOrEmpty(TenantId)
                ? new DefaultAzureCredential()
                : new DefaultAzureCredential(new DefaultAzureCredentialOptions { TenantId = TenantId });
            created = new AzureOpenAIClient(new Uri(Url), credential);
        }
        return Interlocked.CompareExchange(ref _client, created, null) ?? created;
    }
}

public class TranslatorEntry : PoolEntry
{
    public string Url { get; init; } = "https://api.cognitive.microsofttranslator.com";
    public string Key { get; init; } = "";
    public string Region { get; init; } = "";
    public string ResourceId { get; init; } = "";
    public string TenantId { get; init; } = "";

    private DefaultAzureCredential? _credential;
    public DefaultAzureCredential GetOrCreateCredential()
    {
        if (_credential is not null) return _credential;
        var created = string.IsNullOrEmpty(TenantId)
            ? new DefaultAzureCredential()
            : new DefaultAzureCredential(new DefaultAzureCredentialOptions { TenantId = TenantId });
        return Interlocked.CompareExchange(ref _credential, created, null) ?? created;
    }
}

public class SpeechEntry : PoolEntry
{
    public string Key { get; init; } = "";
    public string Region { get; init; } = "eastus";
    public string TenantId { get; init; } = "";
    public string ResourceEndpoint { get; init; } = "";

    private DefaultAzureCredential? _credential;
    public DefaultAzureCredential GetOrCreateCredential()
    {
        if (_credential is not null) return _credential;
        var created = string.IsNullOrEmpty(TenantId)
            ? new DefaultAzureCredential()
            : new DefaultAzureCredential(new DefaultAzureCredentialOptions { TenantId = TenantId });
        return Interlocked.CompareExchange(ref _credential, created, null) ?? created;
    }
}

public class KeyPool<T>(IReadOnlyList<T> entries) where T : PoolEntry
{
    private int _cursor = -1;

    public int Count => entries.Count;

    public T? GetNext()
    {
        var count = entries.Count;
        if (count == 0) return null;
        for (int i = 0; i < count; i++)
        {
            var idx = (int)((uint)Interlocked.Increment(ref _cursor) % (uint)count);
            if (entries[idx].IsAvailable) return entries[idx];
        }
        return null;
    }

    public int GetMinRetryAfterSeconds()
        => entries.Count == 0 ? 15
            : entries.Select(e => e.GetRetryAfterSeconds()).Where(s => s > 0).DefaultIfEmpty(15).Min();
}

public class AzureKeyPoolService
{
    public KeyPool<FoundryEntry> FoundryTextPool { get; }
    public KeyPool<FoundryEntry> FoundryImagePool { get; }
    public KeyPool<TranslatorEntry> TranslatorPool { get; }
    public KeyPool<SpeechEntry> SpeechPool { get; }

    public AzureKeyPoolService(IConfiguration config)
    {
        FoundryTextPool = BuildFoundryPool(config, "AzureAIFoundryText");
        FoundryImagePool = BuildFoundryPool(config, "AzureAIFoundryImage");
        TranslatorPool = BuildTranslatorPool(config);
        SpeechPool = BuildSpeechPool(config);
    }

    private static KeyPool<FoundryEntry> BuildFoundryPool(IConfiguration config, string section)
    {
        var entries = config.GetSection($"{section}:Endpoints").GetChildren()
            .Select(s => new FoundryEntry
            {
                Url = s["Url"] ?? "",
                Key = s["Key"] ?? "",
                TenantId = s["TenantId"] ?? ""
            })
            .Where(e => !string.IsNullOrEmpty(e.Url))
            .ToList();

        if (entries.Count == 0)
        {
            var url = config[$"{section}:Endpoint"] ?? "";
            if (!string.IsNullOrEmpty(url))
                entries.Add(new FoundryEntry
                {
                    Url = url,
                    Key = config[$"{section}:Key"] ?? "",
                    TenantId = config[$"{section}:TenantId"] ?? ""
                });
        }
        return new KeyPool<FoundryEntry>(entries);
    }

    private static KeyPool<TranslatorEntry> BuildTranslatorPool(IConfiguration config)
    {
        var entries = config.GetSection("AzureTranslator:Keys").GetChildren()
            .Select(s => new TranslatorEntry
            {
                Url = s["Url"] ?? "https://api.cognitive.microsofttranslator.com",
                Key = s["Key"] ?? "",
                Region = s["Region"] ?? "",
                ResourceId = s["ResourceId"] ?? "",
                TenantId = s["TenantId"] ?? ""
            })
            .Where(e => !string.IsNullOrEmpty(e.Url))
            .ToList();

        if (entries.Count == 0)
        {
            var url = config["AzureTranslator:Endpoint"] ?? "";
            if (!string.IsNullOrEmpty(url))
                entries.Add(new TranslatorEntry
                {
                    Url = url,
                    Key = config["AzureTranslator:Key"] ?? "",
                    Region = config["AzureTranslator:Region"] ?? "",
                    ResourceId = config["AzureTranslator:ResourceId"] ?? ""
                });
        }
        return new KeyPool<TranslatorEntry>(entries);
    }

    private static KeyPool<SpeechEntry> BuildSpeechPool(IConfiguration config)
    {
        var entries = config.GetSection("AzureSpeech:Keys").GetChildren()
            .Select(s => new SpeechEntry
            {
                Key = s["Key"] ?? "",
                Region = s["Region"] ?? "eastus",
                TenantId = s["TenantId"] ?? "",
                ResourceEndpoint = s["ResourceEndpoint"] ?? ""
            })
            .Where(e => !string.IsNullOrEmpty(e.Region))
            .ToList();

        if (entries.Count == 0)
        {
            var region = config["AzureSpeech:Region"] ?? "";
            if (!string.IsNullOrEmpty(region))
                entries.Add(new SpeechEntry
                {
                    Key = config["AzureSpeech:Key"] ?? "",
                    Region = region,
                    TenantId = config["AzureSpeech:TenantId"] ?? ""
                });
        }
        return new KeyPool<SpeechEntry>(entries);
    }
}
