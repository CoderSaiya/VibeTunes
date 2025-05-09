using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class UpdateAlbumHandler(
    IAlbumRepository albumRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpdateAlbumCommand, Guid>
{
    public async Task<Guid> Handle(UpdateAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.AlbumId);
        if (album == null)
            throw new BusinessException("Album not found.");
        
        album.Title = request.Title ?? album.Title;
        album.ReleaseDate = request.ReleaseDate ?? album.ReleaseDate;
        
        var imgUrl = album.CoverImgUrl;
        if (request.Image is not null)
        {
            await fileService.DeleteFileAsync(imgUrl, cancellationToken);
            
            imgUrl = $"albums/{album.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
            await using (var albumStream = request.Image.OpenReadStream())
            {
                await fileService.UploadFileAsync(albumStream, imgUrl, cancellationToken);
            }
        }
        album.CoverImgUrl = imgUrl;
        
        var updated = await albumRepository.UpdateAlbumAsync(album);
        if (!updated)
            throw new BusinessException("Unable to update album.");
             
        await unitOfWork.CommitAsync();
        
        return album.Id;
    }
}