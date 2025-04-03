using System.Net;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Common;

namespace VibeTunes.Infrastructure.Services;

public class S3FileService(
    IAmazonS3 s3Client, 
    IOptions<AWSOptions> awsOptions,
    IConfiguration configuration
    ) : IFileService
{
    private readonly string _bucketName = awsOptions.Value.BucketName;

    public async Task UploadFileAsync(Stream fileStream, string key, CancellationToken cancellationToken)
    {
        var putObject = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            AutoCloseStream = true,
        };
        
        await s3Client.PutObjectAsync(putObject, cancellationToken);
    }

    public async Task<Stream?> GetFileStreamAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            var response = await s3Client.GetObjectAsync(_bucketName, key, cancellationToken);
            return response.ResponseStream;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }
    
    public async Task<string> GetUrlAsync(string key, CancellationToken cancellationToken)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddHours(10),
            Verb = HttpVerb.GET
        };
        
        return await s3Client.GetPreSignedURLAsync(request);
    }

    public async Task<Stream> DownloadFileAsync(string fileName, CancellationToken cancellationToken)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };
        
        var response = await s3Client.GetObjectAsync(getRequest, cancellationToken);
        return response.ResponseStream;
    }

    public async Task DeleteFileAsync(string fileName, CancellationToken cancellationToken)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };
        
        await s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
    }
    
    public async Task<string> SaveFileAsync(byte[] content, string fileName, string? action, CancellationToken cancellationToken)
    {
        var baseFolder = configuration["FilePath:Data"]!;
        
        if (!Directory.Exists(baseFolder))
        {
            Directory.CreateDirectory(baseFolder);
        }
        
        var filePath = Path.Combine(baseFolder, fileName);

        if (action is not null && action.ToLower() == "add")
        {
            await using var stream = new FileStream(filePath, FileMode.Append, FileAccess.Write, FileShare.None, 4096,
                useAsync: true);
            await stream.WriteAsync(content, 0, content.Length, cancellationToken);
        }
        else
        {
            await File.WriteAllBytesAsync(filePath, content, cancellationToken);
        }
        
        return filePath;
    }
}