using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongByArtistHandler(
    ISongRepository songRepository,
    IMediator mediator
    ) : IRequestHandler<GetSongByArtistQuery, IEnumerable<SongDto>>
{
    public async Task<IEnumerable<SongDto>> Handle(GetSongByArtistQuery request, CancellationToken cancellationToken)
    {
        var artistId = request.ArtistId;
        
        await mediator.Send(new CheckValidUserCommand(artistId), cancellationToken);
        
        var songs = await songRepository.GetSongByArtistAsync(artistId);
        
        var result = new List<SongDto>(songs.Count());
        foreach (var s in songs)
        {
            var dto = await mediator.Send(new GetSongByIdQuery(s.Id), cancellationToken);
            result.Add(dto);
        }

        return result;
    }
}