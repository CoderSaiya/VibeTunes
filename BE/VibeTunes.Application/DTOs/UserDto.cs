using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.DTOs;

public sealed record UserDto(
    string Username,
    string Password,
    string? FirstName,
    string? LastName,
    string Rank,
    bool IsActive,
    bool IsBanned,
    Address? Address,
    string? Gender,
    string? Avatar);