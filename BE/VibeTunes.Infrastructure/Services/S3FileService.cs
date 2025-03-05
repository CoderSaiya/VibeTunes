using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Common;

namespace VibeTunes.Infrastructure.Services;

public class S3FileService(IAmazonS3 s3Client, IOptions<AWSOptions> awsOptions) : IFileService
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
}