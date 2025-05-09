using MediatR;

namespace VibeTunes.Application.UseCases.Songs.Commands;

public record DeleteSongCommand(Guid SongId) : IRequest<bool>;