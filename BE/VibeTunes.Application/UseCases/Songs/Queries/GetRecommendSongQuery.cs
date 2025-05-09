using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public sealed record GetRecommendSongQuery(Guid UserId) : IRequest<IEnumerable<SongDto>>;