using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Queries;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class GetAlbumsHandler(
    IAlbumRepository albumRepository,
    IFileService fileService,
    IMediator mediator
    ) : IRequestHandler<GetAlbumsQuery, IEnumerable<AlbumDto>>
{
    public async Task<IEnumerable<AlbumDto>> Handle(GetAlbumsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new AlbumFilter();
        var albums = await albumRepository.GetAlbumsByFilterAsync(filter);
            
        var albumTask = albums.Select(async a =>
        {
            var imageUrl = await fileService.GetUrlAsync(a.CoverImgUrl, cancellationToken);

            var songTasks = a.SongsList
                .Select(s => mediator.Send(new GetSongByIdQuery(s.Id), cancellationToken));
        
            var songsList = (await Task.WhenAll(songTasks)).ToList();
            
            var topGenres = await albumRepository.GetTopGenresAsync(a.Id);

            var topGenreName = topGenres.FirstOrDefault()?.GenreName
                               ?? string.Empty;
            
            return new AlbumDto(
                Id: a.Id,
                ArtistId: a.ArtistId,
                ArtistName: a.Artist.StageName,
                Title: a.Title,
                ReleaseDate: a.ReleaseDate.ToString("dd/MM/yyyy"),
                Streams: a.Streams,
                CoverImgUrl: imageUrl,
                IsReleased: a.IsReleased,
                SongsList: songsList,
                TopGenre: topGenreName
            );
        });

        return await Task.WhenAll(albumTask);
    }
}