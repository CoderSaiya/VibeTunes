using MediatR;

namespace VibeTunes.Application.UseCases.Playlists.Commands;

public sealed record DeletePlaylistCommand(
    Guid PlaylistId
    ) : IRequest<bool>;