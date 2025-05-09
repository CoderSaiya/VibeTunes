using MediatR;

namespace VibeTunes.Application.UseCases.Albums.Commands;

public sealed record DeleteAlbumCommand(Guid AlbumId) : IRequest<bool>;