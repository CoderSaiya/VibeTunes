using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Albums.Queries;

public sealed record GetAlbumByIdQuery(Guid AlbumId) : IRequest<AlbumDto>;