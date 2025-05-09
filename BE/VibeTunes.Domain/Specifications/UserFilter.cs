using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Specifications;

public class UserFilter : GlobalFilter
{
    public bool? IsActive { get; init; }
    public bool? IsBanned { get; init; }
    public string? Name { get; init; }
    public string? Address { get; init; }
    public Gender? Gender { get; init; }
}