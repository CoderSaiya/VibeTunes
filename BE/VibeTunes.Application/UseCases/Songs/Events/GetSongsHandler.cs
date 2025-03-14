using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongsHandler(ISongRepository songRepository): IRequestHandler<GetSongsQuery, IEnumerable<SongDto>>
{
    public async Task<IEnumerable<SongDto>> Handle(GetSongsQuery request, CancellationToken cancellationToken)
    {
        var songs = await songRepository.GetSongByFilterAsync(request.Filter);
        return songs.Select(s => new SongDto(s.Id, s.Title, "", s.Duration, s.FileUrl, s.CoverImgUrl, s.Streams, s.Status));
    }
}