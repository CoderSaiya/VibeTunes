using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Statistics.Queries;

public sealed record GetUserArtistStatisticsQuery(int? Month = null, int? Year = null) : IRequest<IEnumerable<DateCountDto>>;