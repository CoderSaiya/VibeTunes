namespace VibeTunes.Application.DTOs;

public class SongFilterParameters
{
    public string? TitleContains { get; set; }
    public string? Genre { get; set; }
    public TimeSpan? MinDuration { get; set; }
    public TimeSpan? MaxDuration { get; set; }
    public DateTime? ReleaseAfter { get; set; }
    public DateTime? ReleaseBefore { get; set; }
    
    public string SortBy { get; set; } = "Title";
    public string SortDirection { get; set; } = "asc";
    
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}