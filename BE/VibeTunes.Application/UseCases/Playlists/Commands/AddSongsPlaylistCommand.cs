using MediatR;

namespace VibeTunes.Application.UseCases.Playlists.Commands;

public sealed record AddSongsPlaylistCommand(
    string PlaylistId, 
    List<string> SongIds
    ) : IRequest<Guid>;