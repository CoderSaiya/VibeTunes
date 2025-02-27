using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.DTOs;

public record ProfileDto(Name Name, Address? Address, Gender? Gender, string? Avatar );