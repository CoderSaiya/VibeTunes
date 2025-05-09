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
        
        // split genre
        var genreNames = request.Genre
            .Split(", ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(g => g.ToLowerInvariant())
            .Distinct()
            .ToList();
        
        var existingGenres = await genreRepository.GetGenreByNameAsync(genreNames);
        if (existingGenres.Count != genreNames.Count)
        {
            var existingGenreNames = existingGenres.Select(g => g.GenreName.ToLowerInvariant()).ToList();
            var invalidGenres = genreNames.Except(existingGenreNames).ToList();
            throw new BusinessException($"Invalid genres: {string.Join(", ", invalidGenres)}");
        }
        
        // upload audio & image
        var audioKey = $"audios/{existingArtist.Id}/{Guid.NewGuid()}_{request.Audio.FileName}";
        TimeSpan duration;
        await using (var audioStream = request.Audio.OpenReadStream())
        {
            // Tạo memory stream để xử lý
            var memoryStream = new MemoryStream();
            await audioStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0; // Reset stream position

            try
            {
                // Đọc metadata audio
                var file = TagLib.File.Create(new StreamFileAbstraction(request.Audio.FileName, memoryStream, null));
                duration = file.Properties.Duration;
            }
            catch (Exception ex)
            {
                throw new BusinessException("Invalid audio file format");
            }

            // Upload lại từ đầu stream
            memoryStream.Position = 0;
            await fileService.UploadFileAsync(audioStream, audioKey, cancellationToken);
        }
        
        var imageKey = $"images/{existingArtist.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
        await using (var imageStream = request.Image.OpenReadStream())
        {
            await fileService.UploadFileAsync(imageStream, imageKey, cancellationToken);
        }
        
        // create song
        var newSong = new Song
        {
            ArtistId = existingArtist.Id,
            AlbumId = request.AlbumId,
            Title = request.Title,
            CoverImgUrl = imageKey,
            FileUrl = audioKey,
            ReleaseDate = request.ReleaseDate,
            Genres = existingGenres,
            Duration = duration
        };
        
        await songRepository.AddSongAsync(newSong);
        
        // send notification to artist
        await notificationService.SendNotification(
            Guid.Parse("c7b70dd9-29c7-45ce-91de-220c9795758a"), 
            existingArtist.Id,
            $"Your new song created: {newSong.Title}"
            );
        
        await unitOfWork.CommitAsync();
        
        return newSong.Id;
    }
}