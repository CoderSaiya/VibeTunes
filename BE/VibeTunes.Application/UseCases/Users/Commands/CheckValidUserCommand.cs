using MediatR;

namespace VibeTunes.Application.UseCases.Users.Commands;

public sealed record CheckValidUserCommand(Guid UserId) : IRequest<Unit>;