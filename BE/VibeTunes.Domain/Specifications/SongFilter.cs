namespace VibeTunes.Domain.Specifications;

public class SongFilter : GlobalFilter
{
    public string? TitleContains { get; init; }
    public string? Genre { get; init; }
    public TimeSpan? MinDuration { get; init; }
    public TimeSpan? MaxDuration { get; init; }
    public DateTime? ReleaseAfter { get; init; }
    public DateTime? ReleaseBefore { get; init; }
}