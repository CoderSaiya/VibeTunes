using MediatR;
using Microsoft.AspNetCore.Http;

namespace VibeTunes.Application.UseCases.Albums.Commands;

public record UpdateAlbumCommand(
    Guid AlbumId,
    string? Title,
    DateOnly? ReleaseDate,
    IFormFile? Image
    ) : IRequest<Guid>;