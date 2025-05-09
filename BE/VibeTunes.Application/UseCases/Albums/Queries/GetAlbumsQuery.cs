using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Albums.Queries;

public sealed record GetAlbumsQuery(AlbumFilter? Filter) : IRequest<IEnumerable<AlbumDto>>;