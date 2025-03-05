using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Artist : User
{
    public string StageName { get; set; }
    public string Bio { get; set; }
    
    public ICollection<Album> Albums { get; set; } = new List<Album>();
    public ICollection<Song> Songs { get; set; } = new List<Song>();

    private Artist() { }

    public Artist(string username, string password, Email emailAddress, string stageName, string bio)
        : base(username, password, emailAddress)
    {
        if (string.IsNullOrWhiteSpace(stageName))
            throw new ArgumentException("StageName cannot be blank", nameof(stageName));
        StageName = stageName;
        Bio = bio;
    }
}