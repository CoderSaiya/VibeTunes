using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Artist(string userName, string password, Email email, string stageName, string bio)
    : User(userName, password, email)
{
    public string StageName { get; private set; } = stageName;
    public string Bio { get; private set; } = bio;
}