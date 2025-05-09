using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class UpdateSongHandler(
    ISongRepository songRepository,
    IFileService fileService,
    IGenreRepository genreRepository,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpdateSongCommand, Unit>
{
    public async Task<Unit> Handle(UpdateSongCommand request, CancellationToken cancellationToken)
    {
        // check song exist
        var existingSong = await songRepository.GetSongByIdAsync(request.Id);
        if (existingSong is null)
            throw new BusinessException("Song not found");
        
        // update image or file url (if any)
        if (request.Audio is not null)
        {
            if  (!string.IsNullOrEmpty(existingSong.FileUrl))
                await fileService.DeleteFileAsync(existingSong.FileUrl, cancellationToken);
                
            var audioKey = $"audios/{existingSong.Id}/{Guid.NewGuid()}_{request.Audio.FileName}";
            await using (var audioStream = request.Audio.OpenReadStream())
            {
                await fileService.UploadFileAsync(audioStream, audioKey, cancellationToken);
            }

            existingSong.FileUrl = audioKey;
        }

        if (request.Image is not null)
        {
            if  (!string.IsNullOrEmpty(existingSong.CoverImgUrl))
                await fileService.DeleteFileAsync(existingSong.CoverImgUrl, cancellationToken);
            
            var imageKey = $"images/{existingSong.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
            await using (var audioStream = request.Image.OpenReadStream())
            {
                await fileService.UploadFileAsync(audioStream, imageKey, cancellationToken);
            }
            
            existingSong.FileUrl = imageKey;
        }
        
        // split genre string
        if (request.Genre is not null)
        {
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
            
            existingSong.Genres = existingGenres;
        }
        
        if (request.ReleaseDate is not null && request.ReleaseDate < DateTime.Today)
            existingSong.ReleaseDate = (DateTime) request.ReleaseDate;
        
        // update song
        var updateSong = new Song
        {
            Title = request.Title ?? existingSong.Title,
            Streams = request.Streams ?? existingSong.Streams,
            Status = request.Status ?? existingSong.Status,
        };
        
        // commit change
        await unitOfWork.CommitAsync();
        
        return Unit.Value;
    }
}