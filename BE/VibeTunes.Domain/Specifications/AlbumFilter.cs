namespace VibeTunes.Domain.Specifications;

public class AlbumFilter : GlobalFilter
{
    public string? Keyword { get; set; }
    public string? ByArtist { get; set; }
    public DateOnly? MinReleaseDate { get; set; }
    public DateOnly? MaxReleaseDate { get; set; }
    public int? MinStreams { get; set; }
    public int? MaxStreams { get; set; }
}