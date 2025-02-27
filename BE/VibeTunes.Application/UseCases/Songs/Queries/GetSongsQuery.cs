using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public record GetSongsQuery(SongFilterParameters Filter) : IRequest<IEnumerable<SongDto>>;