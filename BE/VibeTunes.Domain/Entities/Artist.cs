using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Artist : User
{
    public string StageName { get; private set; }
    public string Bio { get; private set; }
    
    private Artist() { }

    public Artist(string userName, string password, Email email, string stageName, string bio)
        : base(userName, password, email)
    {
        if (string.IsNullOrWhiteSpace(stageName))
            throw new ArgumentException("StageName not blank", nameof(stageName));
        StageName = stageName;
        Bio = bio;
    }
}