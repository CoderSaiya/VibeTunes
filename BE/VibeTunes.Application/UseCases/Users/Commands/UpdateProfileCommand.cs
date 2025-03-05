using MediatR;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Users.Commands;

public record UpdateProfileCommand(
    Guid UserId,
    string? FirstName,
    string? LastName,
    string? Address,
    string? Gender,
    string? Avatar
    ) : IRequest<Unit>;