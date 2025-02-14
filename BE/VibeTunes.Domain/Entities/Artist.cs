using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Artist : User
{
    public string StageName { get; private set; }
    public string Bio { get; private set; }
    
    public ICollection<Album> Albums { get; set; } = new List<Album>();
    public ICollection<Song> Songs { get; set; } = new List<Song>();

    private Artist() { }

    public Artist(string username, string password, Email email, string stageName, string bio)
        : base(username, password, email)
    {
        if (string.IsNullOrWhiteSpace(stageName))
            throw new ArgumentException("StageName cannot be blank", nameof(stageName));
        StageName = stageName;
        Bio = bio;
    }
}