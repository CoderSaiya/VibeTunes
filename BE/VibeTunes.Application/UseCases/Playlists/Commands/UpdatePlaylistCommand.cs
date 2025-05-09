using MediatR;
using Microsoft.AspNetCore.Http;

namespace VibeTunes.Application.UseCases.Playlists.Commands;

public sealed record UpdatePlaylistCommand(
    Guid PlaylistId,
    string? Name = null,
    string? Description = null,
    IFormFile? Image = null,
    bool? IsPublic = null,
    List<Guid>? SongIds = null
    ) : IRequest<Guid>;