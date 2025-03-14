using MediatR;

namespace VibeTunes.Application.UseCases.Genres.Commands;

public record AddGenreCommand(
    string Name,
    string? Description
    ) : IRequest<Guid>;