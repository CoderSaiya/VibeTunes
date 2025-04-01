using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongStreamHandler(
    IFileService fileService, 
    ISongRepository songRepository,
    IHistoryRepository historyRepository,
    IHttpContextAccessor httpContextAccessor,
    IBackgroundTaskQueue backgroundTaskQueue,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<GetSongStreamQuery, string?>
{
    public async Task<string?> Handle(GetSongStreamQuery request, CancellationToken cancellationToken)
    {
        // check song exist
        var existingSong = await songRepository.GetSongByIdAsync(request.SongId);
        if (existingSong is null)
            throw new BusinessException("Song does not exist");
        
        // check range request
        var httpContext = httpContextAccessor.HttpContext;
        var isRangeRequest = httpContext?.Request.Headers.ContainsKey("Range") ?? false;
        var isHeadRequest = string.Equals(httpContext?.Request.Method, "HEAD", StringComparison.OrdinalIgnoreCase);
        
        // update history
        if (!isRangeRequest && !isHeadRequest)
        {
            backgroundTaskQueue.Enqueue(async ct =>
            {
                var history = new History
                {
                    UserId = request.UserId,
                    SongId = request.SongId,
                    ListenDuration = 0
                };

                await historyRepository.CreateHistoryAsync(history);
                await unitOfWork.CommitAsync();

                // log (CSV) in append format
                var sb = new StringBuilder();
                sb.AppendLine($"{GuidConverter.ToFloat(history.UserId)}," +
                              $"{GuidConverter.ToFloat(history.SongId)}," +
                              $"{history.ListenDuration}");

                var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
                var fileName = "song-rating.csv";
                await fileService.SaveFileAsync(csvBytes, fileName, "add", ct);
            });
        }
        
        // return file stream
        return await fileService.GetUrlAsync(existingSong.FileUrl, cancellationToken);
    }
}