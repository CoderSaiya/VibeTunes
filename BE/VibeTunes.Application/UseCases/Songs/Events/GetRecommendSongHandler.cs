using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetRecommendSongHandler(
    ISongRepository songRepository,
    IRecommendationService recommendationService,
    IFileService fileService
    ) : IRequestHandler<GetRecommendSongQuery, IEnumerable<SongDto>>
{
    public async Task<IEnumerable<SongDto>> Handle(GetRecommendSongQuery request, CancellationToken cancellationToken)
    {
        var songs = await songRepository.GetAllSongsAsync();
        var list = songs as Song[] ?? songs.ToArray();
        if (!list.Any())
            throw new BusinessException("No songs available");
        
        var songFloats = list.Select(s => GuidConverter.ToFloat(s.Id)).ToList();
        var userFloat = GuidConverter.ToFloat(request.UserId);
        
        var scores = await recommendationService.PredictAsync(userFloat, songFloats);
        
        var recommended = list.Zip(scores, (song, score) => new { song, score })
            .OrderByDescending(x => float.IsInfinity(x.score) ? 0 : x.score)
            .ToList();
        
        var dtoTasks = recommended.Select(async x =>
        {
            var s = x.song;
            var genreString = s.Genres.Any()
                ? string.Join(", ", s.Genres.Select(g => g.GenreName))
                : string.Empty;
            var duration = s.Duration.ToString(@"mm\:ss");

            var fileUrl = await fileService.GetUrlAsync(s.FileUrl, cancellationToken);
            var coverUrl = await fileService.GetUrlAsync(s.CoverImgUrl, cancellationToken);

            return new SongDto(
                Id: s.Id,
                Title: s.Title,
                Artist: s.Artist.StageName,
                Genre: genreString,
                Duration: duration,
                FileUrl: fileUrl,
                CoverImgUrl: coverUrl,
                Streams: s.Streams,
                Status: s.Status.ToString(),
                CreatedAt: s.CreatedDate.ToString("dd/MM/yyyy"),
                AlbumTitle: s.Album?.Title,
                ReleaseDate: s.ReleaseDate.ToString("dd/MM/yyyy")
            );
        });
        
        var dtos = await Task.WhenAll(dtoTasks);
        return dtos.ToList();
    }
}