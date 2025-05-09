namespace VibeTunes.Domain.ValueObjects;

public class DateCount
{
    public string Name { get; set; } = null!;
    public int TotalUsers { get; set; }
    public int TotalArtists { get; set; }
}