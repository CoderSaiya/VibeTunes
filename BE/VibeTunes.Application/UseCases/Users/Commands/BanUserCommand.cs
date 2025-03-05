using MediatR;

namespace VibeTunes.Application.UseCases.Users.Commands;

public record BanUserCommand(Guid UserId) : IRequest<Guid>;