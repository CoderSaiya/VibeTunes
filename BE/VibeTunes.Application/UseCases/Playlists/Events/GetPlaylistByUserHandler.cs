using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Playlists.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class GetPlaylistByUserHandler(
    IPlaylistRepository playlistRepository,
    IMediator mediator
) : IRequestHandler<GetPlaylistByUserQuery, IEnumerable<PlaylistDto>>
{
    public async Task<IEnumerable<PlaylistDto>> Handle(GetPlaylistByUserQuery request, CancellationToken cancellationToken)
    {
        var playlists = await playlistRepository.GetPlaylistsByUserIdAsync(request.UserId);

        var result = new List<PlaylistDto>();
        foreach (var p in playlists)
        {
            var playlistDto = await mediator.Send(new GetPlaylistByIdQuery(p.Id), cancellationToken);
            result.Add(playlistDto);
        }
        
        return result;
    }
}