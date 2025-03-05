using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record LoginUserCommand(
    string Email,
    string Password
    ) : IRequest<TokenDto>;