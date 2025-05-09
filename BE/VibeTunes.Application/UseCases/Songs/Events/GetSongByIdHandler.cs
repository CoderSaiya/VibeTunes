using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Songs.Events;

public class GetSongByIdHandler(
    ISongRepository songRepository,
    IFileService fileService
    ) : IRequestHandler<GetSongByIdQuery, SongDto>
{
    public async Task<SongDto> Handle(GetSongByIdQuery request, CancellationToken cancellationToken)
    {
        var existingSong = await songRepository.GetSongByIdAsync(request.Id);
        if (existingSong is null)
            throw new BusinessException($"Song with Id {request.Id} not found");
        
        var imageUrl = await fileService.GetUrlAsync(existingSong.CoverImgUrl, cancellationToken);
        var audioUrl = await fileService.GetUrlAsync(existingSong.FileUrl, cancellationToken);
            
        var genreString = existingSong.Genres.Any()
            ? string.Join(", ", existingSong.Genres.Select(g => g.GenreName))
            : string.Empty;
            
        return new SongDto(
            existingSong.Id,
            existingSong.Title,
            existingSong.Artist.StageName,
            genreString,
            existingSong.Duration.ToString(@"mm\:ss"), 
            audioUrl,
            imageUrl,
            existingSong.Streams, 
            existingSong.Status.ToString(),
            existingSong.CreatedDate.ToString("dd/MM/yyyy")
        );
    }
}