﻿namespace VibeTunes.Application.Interfaces;

public interface IFileService
{
    public Task UploadFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken);
    public Task<Stream?> GetFileStreamAsync(string fileName, CancellationToken cancellationToken);
    Task<string> GetUrlAsync(string key, CancellationToken cancellationToken);
    Task<Stream> DownloadFileAsync(string fileName, CancellationToken cancellationToken);
    public Task DeleteFileAsync(string fileName, CancellationToken cancellationToken);
    public Task<string> SaveFileAsync(byte[] fileData, string fileName, string action, CancellationToken cancellationToken);
}