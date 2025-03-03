namespace VibeTunes.Application.Interfaces;

public interface IFileService
{
    public Task UploadFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken);
    Task<Stream> DownloadFileAsync(string fileName, CancellationToken cancellationToken);
}