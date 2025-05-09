using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Users.Queries;

public record GetHotArtistQuery(int? Size = 5) : IRequest<IEnumerable<HotArtistDto>>;