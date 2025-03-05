using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record RefreshTokenCommand(
    string RefreshToken
    ) : IRequest<string>;