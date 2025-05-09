using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Playlists.Queries;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class GetPlaylistByIdHandler(
    IPlaylistRepository playlistRepository,
    IFileService fileService,
    IMediator mediator
    ) : IRequestHandler<GetPlaylistByIdQuery, PlaylistDto>
{
    public async Task<PlaylistDto> Handle(GetPlaylistByIdQuery request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetPlaylistByIdAsync(request.PlaylistId);
        if (playlist is null) 
            throw new BusinessException("Playlist not found.");
        
        var imgUrl = await fileService.GetUrlAsync(playlist.CoverImgUrl, cancellationToken);
        
        var songsList = new List<SongDto>();
        foreach (var s in playlist.Songs)
        {
            var songDto = await mediator.Send(new GetSongByIdQuery(s.Id), cancellationToken);
            songsList.Add(songDto);
        }
        
        return new PlaylistDto(
            playlist.Id,
            playlist.UserId,
            playlist.Name,
            playlist.Description,
            imgUrl,
            playlist.Likes,
            songsList,
            playlist.CreatedDate.ToString("dd/MM/yyyy"));
    }
}