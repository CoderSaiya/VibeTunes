using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record BanUserCommand(Guid UserId) : IRequest<Guid>;