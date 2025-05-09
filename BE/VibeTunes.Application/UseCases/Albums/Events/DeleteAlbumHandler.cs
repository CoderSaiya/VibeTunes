using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class DeleteAlbumHandler(
    IAlbumRepository albumRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ): IRequestHandler<DeleteAlbumCommand, bool>
{
    public async Task<bool> Handle(DeleteAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.AlbumId);
        if (album == null)
            throw new BusinessException("Album not found.");
        
        var key = album.CoverImgUrl;
             
        var deleted = await albumRepository.DeleteAlbumAsync(album);
        if (!deleted)
            throw new BusinessException("Unable to delete album.");
        
        await fileService.DeleteFileAsync(key, cancellationToken);
             
        await unitOfWork.CommitAsync();
        
        return true;
    }
}