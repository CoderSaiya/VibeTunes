using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Genres.Queries;

public record GetGenresQuery() : IRequest<IEnumerable<GenreDto>>;