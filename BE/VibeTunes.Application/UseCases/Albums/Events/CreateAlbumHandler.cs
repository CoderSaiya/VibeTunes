using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class CreateAlbumHandler(
    IAlbumRepository albumRepository,
    IUserRepository userRepository,
    ISongRepository songRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<CreateAlbumCommand, Guid>
{
    public async Task<Guid> Handle(CreateAlbumCommand request, CancellationToken cancellationToken)
    {
        var artist = await userRepository.GetByIdAsync(request.ArtistId);
        if (artist is null)
            throw new BusinessException("Artist not found.");
        
        Album album = new Album
        {
            ArtistId = request.ArtistId,
            Title = request.Title,
            ReleaseDate = request.ReleaseDate,
            IsReleased = request.IsReleased,
        };
        
        var songs = await songRepository.GetSongsByIdsAsync(request.SongIds);
        foreach (var song in songs)
        {
            album.SongsList.Add(song);
        }
        
        var created = await albumRepository.CreateAlbumAsync(album);
        if (!created)
            throw new BusinessException("Unable to create album.");
        
        var imgKey = $"albums/{album.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
        await using (var albumStream = request.Image.OpenReadStream())
        {
            await fileService.UploadFileAsync(albumStream, imgKey, cancellationToken);
        }
        album.CoverImgUrl = imgKey;
             
        await unitOfWork.CommitAsync();
        
        return album.Id;
    }
}