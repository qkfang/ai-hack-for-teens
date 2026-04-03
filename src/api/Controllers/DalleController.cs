using Azure;
using Microsoft.AspNetCore.Mvc;
using OpenAI.Images;
using api.Data;
using api.Models;
using api.Services;

namespace api.Controllers;

[ApiController]
[Route("api/dalle")]
public class DalleController(AIHackDbContext db, IConfiguration config, AzureKeyPoolService keyPool, BlobStorageService blobStorage, IHttpClientFactory httpClientFactory, ILogger<DalleController> logger) : ControllerBase
{
    private ImageClient CreateImageClient(FoundryEntry entry)
    {
        var dalleDeployment = config["AzureAIFoundryImage:Deployment"] ?? "dall-e-3";
        var openAiKey = config["OpenAI:ApiKey"] ?? "";

        if (!string.IsNullOrEmpty(entry.Url))
            return entry.GetOrCreateClient().GetImageClient(dalleDeployment);

        if (!string.IsNullOrEmpty(openAiKey))
        {
            var openAiClient = new OpenAI.OpenAIClient(openAiKey);
            return openAiClient.GetImageClient("gpt-image-1");
        }
        throw new InvalidOperationException("AzureAIFoundry or OpenAI credentials must be configured in appsettings");
    }

    private static int ParseRetryAfter(HttpResponseMessage response, int defaultSeconds = 60)
    {
        if (response.Headers.RetryAfter?.Delta is TimeSpan delta)
            return Math.Max(1, (int)Math.Ceiling(delta.TotalSeconds));
        return defaultSeconds;
    }

    private static int ParseRetryAfter(RequestFailedException ex, int defaultSeconds = 60)
    {
        var response = ex.GetRawResponse();
        if (response is not null && response.Headers.TryGetValue("Retry-After", out var val)
            && int.TryParse(val, out var secs))
            return Math.Max(1, secs);
        return defaultSeconds;
    }

    [HttpPost]
    public async Task<IActionResult> GenerateImage([FromBody] DalleRequest request)
    {
        var description = request.Description?.Trim() ?? "";
        if (string.IsNullOrEmpty(description))
            return BadRequest(new { error = "description is required" });

        var entry = keyPool.FoundryImagePool.GetNext();
        if (entry is null)
        {
            var wait = keyPool.FoundryImagePool.GetMinRetryAfterSeconds();
            return StatusCode(429, new { error = "Rate limit reached, please wait.", retryAfter = wait });
        }

        ImageClient imageClient;
        try { imageClient = CreateImageClient(entry); }
        catch (InvalidOperationException ex) { return StatusCode(400, new { error = ex.Message }); }

        try
        {
            var result = await imageClient.GenerateImageAsync(description, new ImageGenerationOptions
            {
                Size = GeneratedImageSize.W1024xH1024,
            });

            var imageUrl = result.Value.ImageUri?.ToString() ?? "";

            if (string.IsNullOrEmpty(imageUrl) && result.Value.ImageBytes != null)
                imageUrl = $"data:image/png;base64,{Convert.ToBase64String(result.Value.ImageBytes.ToArray())}";

            if (string.IsNullOrEmpty(imageUrl))
                return StatusCode(500, new { error = "DALL-E did not return an image. Please check your API configuration or try again later." });

            imageUrl = await UploadToBlobAsync(imageUrl, imageBytes: result.Value.ImageBytes?.ToArray());

            if (request.UserId.HasValue)
            {
                db.Comics.Add(new Comic { UserId = request.UserId.Value, Description = description, ImageUrl = imageUrl });
                await db.SaveChangesAsync();
            }

            return Ok(new { imageUrl });
        }
        catch (RequestFailedException ex) when (ex.Status == 429)
        {
            entry.MarkRateLimited(ParseRetryAfter(ex));
            var wait = keyPool.FoundryImagePool.GetMinRetryAfterSeconds();
            return StatusCode(429, new { error = "Rate limit reached, please wait.", retryAfter = wait });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("edit")]
    public async Task<IActionResult> EditImage([FromBody] DalleEditRequest request)
    {
        var prompt = request.Prompt?.Trim() ?? "";
        var sourceUrl = request.ImageUrl?.Trim() ?? "";
        if (string.IsNullOrEmpty(prompt) || string.IsNullOrEmpty(sourceUrl))
            return BadRequest(new { error = "imageUrl and prompt are required" });

        var entry = keyPool.FoundryImagePool.GetNext();
        if (entry is null)
        {
            var wait = keyPool.FoundryImagePool.GetMinRetryAfterSeconds();
            return StatusCode(429, new { error = "Rate limit reached, please wait.", retryAfter = wait });
        }

        ImageClient imageClient;
        try { imageClient = CreateImageClient(entry); }
        catch (InvalidOperationException ex) { return StatusCode(400, new { error = ex.Message }); }

        try
        {
            byte[] imageBytes;
            if (sourceUrl.StartsWith("data:"))
            {
                var base64 = sourceUrl[(sourceUrl.IndexOf(',') + 1)..];
                imageBytes = Convert.FromBase64String(base64);
            }
            else
            {
                using var http = new HttpClient();
                imageBytes = await http.GetByteArrayAsync(sourceUrl);
            }

            using var stream = new MemoryStream(imageBytes);
            var result = await imageClient.GenerateImageEditAsync(stream, "image.png", prompt, new ImageEditOptions
            {
                Size = GeneratedImageSize.W1024xH1024,
            });

            var imageUrl = result.Value.ImageUri?.ToString() ?? "";
            if (string.IsNullOrEmpty(imageUrl) && result.Value.ImageBytes != null)
                imageUrl = $"data:image/png;base64,{Convert.ToBase64String(result.Value.ImageBytes.ToArray())}";

            if (string.IsNullOrEmpty(imageUrl))
                return StatusCode(500, new { error = "Image edit did not return a result." });

            imageUrl = await UploadToBlobAsync(imageUrl, imageBytes: result.Value.ImageBytes?.ToArray());

            if (request.UserId.HasValue)
            {
                db.Comics.Add(new Comic { UserId = request.UserId.Value, Description = $"Edit: {prompt}", ImageUrl = imageUrl });
                await db.SaveChangesAsync();
            }

            return Ok(new { imageUrl });
        }
        catch (RequestFailedException ex) when (ex.Status == 429)
        {
            entry.MarkRateLimited(ParseRetryAfter(ex));
            var wait = keyPool.FoundryImagePool.GetMinRetryAfterSeconds();
            return StatusCode(429, new { error = "Rate limit reached, please wait.", retryAfter = wait });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private async Task<string> UploadToBlobAsync(string imageUrl, byte[]? imageBytes)
    {
        try
        {
            byte[] bytes;
            if (imageBytes is not null)
            {
                bytes = imageBytes;
            }
            else if (imageUrl.StartsWith("data:"))
            {
                var base64 = imageUrl[(imageUrl.IndexOf(',') + 1)..];
                bytes = Convert.FromBase64String(base64);
            }
            else
            {
                using var http = httpClientFactory.CreateClient();
                bytes = await http.GetByteArrayAsync(imageUrl);
            }

            var fileName = $"{Guid.NewGuid()}.png";
            return await blobStorage.UploadImageAsync(bytes, fileName);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to upload image to blob storage, falling back to original URL.");
            return imageUrl;
        }
    }
}

public record DalleRequest(string? Description, int? UserId);
public record DalleEditRequest(string? ImageUrl, string? Prompt, int? UserId);

