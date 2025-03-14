using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Specifications;

public class UserFilter : GlobalFilter
{
    public bool IsActive { get; init; } = true;
    public bool IsBanned { get; init; } = false;
    public string? Name { get; init; }
    public string? Address { get; init; }
    public Gender? Gender { get; init; }
}