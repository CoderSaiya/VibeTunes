using MediatR;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public record GetSongStreamQuery(
    Guid SongId,
    Guid UserId
    ) : IRequest<Stream?>;