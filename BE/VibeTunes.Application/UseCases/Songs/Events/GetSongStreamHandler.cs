using MediatR;
using Microsoft.AspNetCore.Http;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongStreamHandler(
    IFileService fileService, 
    ISongRepository songRepository,
    IHistoryRepository historyRepository,
    IHttpContextAccessor httpContextAccessor,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<GetSongStreamQuery, Stream?>
{
    public async Task<Stream?> Handle(GetSongStreamQuery request, CancellationToken cancellationToken)
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
            var history = new History
            {
                UserId = request.UserId,
                SongId = request.SongId,
            };

            await historyRepository.CreateHistoryAsync(history);
            await unitOfWork.CommitAsync();
        }
        
        // return file stream
        return await fileService.GetFileStreamAsync(existingSong.FileUrl, cancellationToken);
    }
}