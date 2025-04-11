using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public record GetSongsQuery(SongFilter? Filter) : IRequest<IEnumerable<SongDto>>;