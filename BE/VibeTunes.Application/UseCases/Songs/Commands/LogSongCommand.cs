using MediatR;

namespace VibeTunes.Application.UseCases.Songs.Commands;

public record LogSongCommand(
    Guid SongId,
    Guid UserId
    ) : IRequest<int>;