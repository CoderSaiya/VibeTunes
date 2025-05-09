using MediatR;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class DeleteSongHandler(
    ISongRepository songRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<DeleteSongCommand, bool>
{
    public async Task<bool> Handle(DeleteSongCommand request, CancellationToken cancellationToken)
    {
        var existingSong = await songRepository.GetSongByIdAsync(request.SongId);
        if (existingSong is null)
            return false;

        var imgKey = existingSong.CoverImgUrl;
        var audioKey = existingSong.FileUrl;
        
        await songRepository.DeleteSongAsync(existingSong);
        
        await fileService.DeleteFileAsync(imgKey, cancellationToken);
        await fileService.DeleteFileAsync(audioKey, cancellationToken);
        
        await unitOfWork.CommitAsync();
        return true;
    }
}