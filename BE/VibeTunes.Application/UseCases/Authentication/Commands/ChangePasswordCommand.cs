using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record ChangePasswordCommand(
    Guid UserId,
    string OldPassword,
    string NewPassword
    ) : IRequest<string>;