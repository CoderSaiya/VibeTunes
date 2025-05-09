using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Authentication.Commands;

public record GoogleLoginCommand(string IdToken) : IRequest<TokenDto>;