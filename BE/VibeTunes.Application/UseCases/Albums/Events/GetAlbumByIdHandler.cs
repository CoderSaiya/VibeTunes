using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Queries;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class GetAlbumByIdHandler(
    IAlbumRepository albumRepository,
    IFileService fileService,
    IMediator mediator
    ) : IRequestHandler<GetAlbumByIdQuery, AlbumDto>
{
    public async Task<AlbumDto> Handle(GetAlbumByIdQuery request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.AlbumId);
        if (album == null)
            throw new BusinessException("Album not found.");
        
        var imageUrl = await fileService.GetUrlAsync(album.CoverImgUrl, cancellationToken);
        
        var songTasks = album.SongsList
            .Select(s => mediator.Send(new GetSongByIdQuery(s.Id), cancellationToken));
        
        var songsList = (await Task.WhenAll(songTasks)).ToList();
        
        var topGenres = await albumRepository.GetTopGenresAsync(album.Id);
        var topGenreName = topGenres.FirstOrDefault()?.GenreName
                           ?? string.Empty;
        
        return new AlbumDto
        (
            Id: album.Id,
            ArtistId: album.ArtistId,
            ArtistName: album.Artist.StageName,
            Title: album.Title,
            ReleaseDate: album.ReleaseDate.ToString("dd/MM/yyyy"),
            CoverImgUrl: imageUrl,
            IsReleased: album.IsReleased,
            Streams: album.Streams,
            SongsList: songsList,
            TopGenre: topGenreName
        );
    }
}