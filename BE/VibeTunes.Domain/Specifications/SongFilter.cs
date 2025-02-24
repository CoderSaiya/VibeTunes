namespace VibeTunes.Domain.Specifications;

public class SongFilter
{
    public string? TitleContains { get; init; }
    public string? Genre { get; init; }
    public TimeSpan? MinDuration { get; init; }
    public TimeSpan? MaxDuration { get; init; }
    public DateTime? ReleaseAfter { get; init; }
    public DateTime? ReleaseBefore { get; init; }
    public string SortBy { get; init; } = "Title";
    public string SortDirection { get; init; } = "asc";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}