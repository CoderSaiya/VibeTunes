using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Users.Queries;

public sealed record GetArtistProfileQuery(Guid ArtistId) : IRequest<ArtistDto>;