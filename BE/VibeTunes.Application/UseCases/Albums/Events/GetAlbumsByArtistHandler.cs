using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Albums.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Albums.Events;

public class GetAlbumsByArtistHandler(
    IAlbumRepository albumRepository,
    IMediator mediator
    ) : IRequestHandler<GetAlbumsByArtistQuery, IEnumerable<AlbumDto>>
{
    public async Task<IEnumerable<AlbumDto>> Handle(GetAlbumsByArtistQuery request, CancellationToken cancellationToken)
    {
        var albums = await albumRepository.GetAlbumsByArtistIdAsync(request.ArtistId);

        var result = new List<AlbumDto>();
        foreach (var album in albums)
        {
            var a = await mediator.Send(new GetAlbumByIdQuery(album.Id), cancellationToken);
            result.Add(a);
        }
        
        return result;
    }
}