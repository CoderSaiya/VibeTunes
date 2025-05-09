using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Playlists.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class AddSongsPlaylistHandler(
       IPlaylistRepository playlistRepository,
       IUnitOfWork unitOfWork
    ): IRequestHandler<AddSongsPlaylistCommand, Guid>
{
    public async Task<Guid> Handle(AddSongsPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlistId = Guid.Parse(request.PlaylistId);
        var playlist = await playlistRepository.GetPlaylistByIdAsync(playlistId);
        if (playlist == null)
            throw new BusinessException("There was an error while adding the songs.");
        
        var songGuids = request.SongIds
            .Select(id => Guid.TryParse(id, out Guid guid) ? guid : Guid.Empty)
            .Where(guid => guid != Guid.Empty)
            .ToList();

        if (request.SongIds.Any())
        {
            var added = await playlistRepository.AddSongsAsync(playlist.Id, songGuids);
            if (!added)
            {
                throw new BusinessException("There was an error while adding the songs.");
            }
        }
        
        await unitOfWork.CommitAsync();

        return playlist.Id;
    }
}