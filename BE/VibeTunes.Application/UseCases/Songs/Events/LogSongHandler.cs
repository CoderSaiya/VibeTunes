using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class LogSongHandler(
    ISongLogRepository songLogRepository,
    ISongRepository songRepository,
    IUserRepository userRepository,
    IHistoryRepository historyRepository,
    IHttpContextAccessor httpContextAccessor,
    IBackgroundTaskQueue backgroundTaskQueue,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<LogSongCommand, int>
{
    public async Task<int> Handle(LogSongCommand request, CancellationToken cancellationToken)
    {
        var existingSong = await songRepository.GetSongByIdAsync(request.SongId);
        var existingUser = await userRepository.GetByIdAsync(request.UserId);
        if (existingSong is null || existingUser is null)
            throw new BusinessException("Song or User does not exist");
        
        // var httpContext = httpContextAccessor.HttpContext;
        // var isRangeRequest = httpContext?.Request.Headers.ContainsKey("Range") ?? false;
        // var isHeadRequest = string.Equals(httpContext?.Request.Method, "HEAD", StringComparison.OrdinalIgnoreCase);

        ++existingSong.Streams;
        
        var history = new History
        {
            UserId = request.UserId,
            SongId = request.SongId,
            ListenDuration = 0
        };

        await historyRepository.CreateHistoryAsync(history);
        await songLogRepository.IncrementOrCreateSongLogAsync(request.SongId);
        await unitOfWork.CommitAsync();
        
        backgroundTaskQueue.Enqueue(async ct =>
        {
            var sb = new StringBuilder();
            sb.AppendLine($"{GuidConverter.ToFloat(history.UserId)}," +
                          $"{GuidConverter.ToFloat(history.SongId)}," +
                          $"{history.ListenDuration}");
            
            var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
            var fileName = "song-rating.csv";
            await fileService.SaveFileAsync(csvBytes, fileName, "add", ct);
        });
        
        return existingSong.Streams;
    }
}