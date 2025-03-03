using MediatR;
using Microsoft.AspNetCore.Http;

namespace VibeTunes.Application.UseCases.Songs.Commands;

public record CreateSongCommand(
    Guid ArtistId,
    Guid? AlbumId,
    string Title,
    IFormFile Image,
    IFormFile Audio,
    DateTime ReleaseDate,
    string Genre
    ) : IRequest<Guid>;