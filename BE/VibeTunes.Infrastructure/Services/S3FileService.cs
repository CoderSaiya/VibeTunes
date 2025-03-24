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
            int count = 1;
            string originalFileName = Path.GetFileNameWithoutExtension(fileName);
            string extension = Path.GetExtension(fileName);
            while (File.Exists(filePath))
            {
                string tempFileName = $"{originalFileName}({count++}){extension}";
                filePath = Path.Combine(baseFolder, tempFileName);
            }
        }
        
        await File.WriteAllBytesAsync(filePath, content, cancellationToken);
        return filePath;
    }
}