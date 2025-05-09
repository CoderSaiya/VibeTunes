using MediatR;
using Microsoft.AspNetCore.Http;

namespace VibeTunes.Application.UseCases.Albums.Commands;

public sealed record CreateAlbumCommand(
    Guid ArtistId,
    string Title,
    DateOnly ReleaseDate,
    IFormFile Image,
    List<Guid> SongIds,
    bool IsReleased = false
) : IRequest<Guid>;