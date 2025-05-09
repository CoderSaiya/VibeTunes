using MediatR;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record VerifyCodeCommand(string Email, string Code) : IRequest<Task>;