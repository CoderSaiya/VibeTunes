using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongsHandler(
    ISongRepository songRepository,
    IFileService fileService
    ): IRequestHandler<GetSongsQuery, IEnumerable<SongDto>>
{
    public async Task<IEnumerable<SongDto>> Handle(GetSongsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new SongFilter();
        var songs = await songRepository.GetSongByFilterAsync(filter);
        var songTasks = songs.Select(async s =>
        {
            var imageUrl = await fileService.GetUrlAsync(s.CoverImgUrl, cancellationToken);
            var audioUrl = await fileService.GetUrlAsync(s.FileUrl, cancellationToken);
            
            var genreString = s.Genres.Any()
                ? string.Join(", ", s.Genres.Select(g => g.GenreName))
                : string.Empty;
            
            return new SongDto(
                s.Id, 
                s.Title, 
                s.Artist.StageName,
                genreString,
                s.Duration, 
                audioUrl,
                imageUrl,
                s.Streams, 
                s.Status
            );
        });
        
        return await Task.WhenAll(songTasks);
    }
}