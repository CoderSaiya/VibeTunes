using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class CreateSongHandler(
    ISongRepository songRepository,
    IUserRepository userRepository,
    IGenreRepository genreRepository,
    INotificationService notificationService,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<CreateSongCommand, Guid>
{
    public async Task<Guid> Handle(CreateSongCommand request, CancellationToken cancellationToken)
    {
        // check artist exist
        var existingArtist = await userRepository.GetByIdAsync(request.ArtistId);
        if (existingArtist is null)
            throw new BusinessException("Artist not found!");
        
        // upload audio & image
        var audioKey = $"audios/{existingArtist.Id}/{Guid.NewGuid()}_{request.Audio.FileName}";
        await using (var audioStream = request.Audio.OpenReadStream())
        {
            await fileService.UploadFileAsync(audioStream, audioKey, cancellationToken);
        }
        
        var imageKey = $"images/{existingArtist.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
        await using (var imageStream = request.Image.OpenReadStream())
        {
            await fileService.UploadFileAsync(imageStream, imageKey, cancellationToken);
        }
        
        // create song
        var genreNames = request.Genre
            .Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct()
            .ToList();
        
        var existingGenres = await genreRepository.GetGenreByNameAsync(genreNames);
        if (existingGenres.Count != genreNames.Count)
        {
            var invalidGenres = genreNames.Except(existingGenres.Select(g => g.GenreName)).ToList();
            throw new BusinessException($"Invalid genres: {string.Join(", ", invalidGenres)}");
        }
        
        var newSong = new Song
        {
            ArtistId = existingArtist.Id,
            AlbumId = request.AlbumId,
            Title = request.Title,
            CoverImgUrl = imageKey,
            FileUrl = audioKey,
            ReleaseDate = request.ReleaseDate,
            Genres = existingGenres,
        };
        
        await songRepository.AddSongAsync(newSong);
        
        // send notification to artist
        await notificationService.SendNotification(
            "admin",
            existingArtist.Username,
            $"Your new song created: {newSong.Title}"
            );
        
        await unitOfWork.CommitAsync();
        
        return newSong.Id;
    }
}