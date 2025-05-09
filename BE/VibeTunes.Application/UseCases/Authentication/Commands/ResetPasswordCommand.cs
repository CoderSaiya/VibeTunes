using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public sealed record ResetPasswordCommand(string Email, string Password) : IRequest<Task>;