using MediatR;
using Microsoft.AspNetCore.Http;

namespace VibeTunes.Application.UseCases.Playlists.Commands;

public record CreatePlaylistCommand(
    string UserId,
    string Name,
    string Description,
    IFormFile Image,
    bool IsPublic = false,
    List<string>? SongIds = null
    ) : IRequest<Guid>;