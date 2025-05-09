using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public sealed record ForgotPasswordCommand(string Email) : IRequest<Task>;