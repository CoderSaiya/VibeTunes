using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Statistics.Queries;

public sealed record GetStatisticsQuery : IRequest<StatisticsDto>;