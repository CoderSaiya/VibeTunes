using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record RegisterUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password
    ) : IRequest<Guid>;