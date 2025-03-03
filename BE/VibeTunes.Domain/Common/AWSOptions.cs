namespace VibeTunes.Domain.Common;

public sealed class AWSOptions
{
    public string Profile { get; set; }
    public string Region { get; set; }
    public string BucketName { get; set; }
}