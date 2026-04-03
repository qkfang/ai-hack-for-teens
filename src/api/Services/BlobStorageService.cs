using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace api.Services;

public class BlobStorageService
{
    private const string ContainerName = "images";
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration config)
    {
        var accountName = config["AzureStorage:AccountName"] ?? "";
        if (string.IsNullOrEmpty(accountName))
            throw new InvalidOperationException("AzureStorage:AccountName is not configured.");

        var tenantId = config["AzureStorage:TenantId"] ?? "";
        var credentialOptions = new DefaultAzureCredentialOptions();
        if (!string.IsNullOrEmpty(tenantId))
            credentialOptions.TenantId = tenantId;

        var serviceUri = new Uri($"https://{accountName}.blob.core.windows.net");
        var serviceClient = new BlobServiceClient(serviceUri, new DefaultAzureCredential(credentialOptions));
        _containerClient = serviceClient.GetBlobContainerClient(ContainerName);
    }

    public async Task<string> UploadImageAsync(byte[] imageBytes, string fileName)
    {
        await _containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = _containerClient.GetBlobClient(fileName);
        using var stream = new MemoryStream(imageBytes);
        await blobClient.UploadAsync(stream, overwrite: true);
        return blobClient.Uri.ToString();
    }

    public async Task<string> UploadBase64IfNeededAsync(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl) || !imageUrl.StartsWith("data:"))
            return imageUrl;

        var base64 = imageUrl[(imageUrl.IndexOf(',') + 1)..];
        var bytes = Convert.FromBase64String(base64);
        var fileName = $"{Guid.NewGuid()}.png";
        return await UploadImageAsync(bytes, fileName);
    }
}
