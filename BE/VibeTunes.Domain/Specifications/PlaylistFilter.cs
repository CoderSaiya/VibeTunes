namespace VibeTunes.Domain.Specifications;

public class PlaylistFilter : GlobalFilter
{
    public string? Keyword { get; set; }
    public bool? IsPublic { get; set; } = true;
}