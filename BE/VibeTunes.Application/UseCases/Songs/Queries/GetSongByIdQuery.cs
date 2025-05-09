using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public sealed record GetSongByIdQuery(Guid Id) : IRequest<SongDto>;