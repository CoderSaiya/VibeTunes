﻿using MediatR;
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
        var existingSong = await songRepository.GetSongByIdAsync(request.Request.Id);
        if (existingSong is null)
            throw new BusinessException("Song not found");
        
        // update image or file url (if any)
        if (request.Request.Audio is not null)
        {
            if  (!string.IsNullOrEmpty(existingSong.FileUrl))
                await fileService.DeleteFileAsync(existingSong.FileUrl, cancellationToken);
                
            var audioKey = $"audios/{existingSong.Id}/{Guid.NewGuid()}_{request.Request.Audio.FileName}";
            await using (var audioStream = request.Request.Audio.OpenReadStream())
            {
                await fileService.UploadFileAsync(audioStream, audioKey, cancellationToken);
            }

            existingSong.FileUrl = audioKey;
        }

        if (request.Request.Image is not null)
        {
            if  (!string.IsNullOrEmpty(existingSong.CoverImgUrl))
                await fileService.DeleteFileAsync(existingSong.CoverImgUrl, cancellationToken);
            
            var imageKey = $"images/{existingSong.Id}/{Guid.NewGuid()}_{request.Request.Image.FileName}";
            await using (var audioStream = request.Request.Image.OpenReadStream())
            {
                await fileService.UploadFileAsync(audioStream, imageKey, cancellationToken);
            }
            
            existingSong.FileUrl = imageKey;
        }
        
        // split genre string
        if (request.Request.Genre is not null)
        {
            var genreNames = request.Request.Genre
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
        
        if (request.Request.ReleaseDate is not null && request.Request.ReleaseDate < DateTime.Today)
            existingSong.ReleaseDate = (DateTime) request.Request.ReleaseDate;
        
        // update song
        var updateSong = new Song
        {
            Title = request.Request.Title ?? existingSong.Title,
            Streams = request.Request.Streams ?? existingSong.Streams,
            Status = request.Request.Status ?? existingSong.Status,
        };
        
        // commit change
        await unitOfWork.CommitAsync();
        
        return Unit.Value;
    }
}