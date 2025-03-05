using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Songs.Commands;

public record UpdateSongCommand(SongDto Request) : IRequest<Unit>;