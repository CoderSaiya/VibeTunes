using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Playlists.Queries;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class GetPlaylistsHandler(
    IPlaylistRepository playlistRepository,
    IFileService fileService,
    IMediator mediator
    ) : IRequestHandler<GetPlaylistsQuery, IEnumerable<PlaylistDto>>
{
    public async Task<IEnumerable<PlaylistDto>> Handle(GetPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new PlaylistFilter();
        var playlists = await playlistRepository.GetPlaylistsByFilterAsync(filter);
        
        var result = new List<PlaylistDto>();

        foreach (var p in playlists)
        {
            var imageUrl = await fileService.GetUrlAsync(p.CoverImgUrl, cancellationToken);
            
            var songsList = new List<SongDto>();
            foreach (var s in p.Songs)
            {
                var songDto = await mediator.Send(new GetSongByIdQuery(s.Id), cancellationToken);
                songsList.Add(songDto);
            }

            result.Add(new PlaylistDto(
                Id: p.Id,
                UserId: p.UserId,
                Name: p.Name,
                Description: p.Description,
                CoverImageUrl: imageUrl,
                Likes: p.Likes,
                SongsList: songsList,
                CreatedDate: p.CreatedDate.ToString("dd/MM/yyyy")
            ));
        }
        
        return result;
    }
}