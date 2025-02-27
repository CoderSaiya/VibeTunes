using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongsHandler(ISongRepository songRepository): IRequestHandler<GetSongsQuery, IEnumerable<SongDto>>
{
    public async Task<IEnumerable<SongDto>> Handle(GetSongsQuery request, CancellationToken cancellationToken)
    {
        var filter = new SongFilter
        {
            TitleContains = request.Filter.TitleContains,
            Genre = request.Filter.Genre,
            MinDuration = request.Filter.MinDuration,
            MaxDuration = request.Filter.MaxDuration,
            ReleaseAfter = request.Filter.ReleaseAfter,
            ReleaseBefore = request.Filter.ReleaseBefore,
            SortBy = request.Filter.SortBy,
            SortDirection = request.Filter.SortDirection,
            PageNumber = request.Filter.PageNumber,
            PageSize = request.Filter.PageSize
        };

        var songs = await songRepository.GetSongByFilterAsync(filter);
        return songs.Select(s => new SongDto(s.Id, s.Title, "", s.Duration, s.FileUrl, s.CoverImgUrl, s.Streams, s.Status));
    }
}