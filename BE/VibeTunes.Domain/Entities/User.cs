using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; }
    public string Password {get; set;}
    public Email EmailAddress {get; set;}
    public SubscriptionValue Rank { get; set; } = SubscriptionValue.Normal;
    public bool IsActive { get; set; } = false;
    public string ActiveCode {get; set;} = string.Empty!;
    public bool IsBanned { get; set; } = false;

    public Profile Profile { get; set; } = null!;
    
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<History> Histories { get; set; } = new List<History>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    
    protected User() {}

    public User(string username, string password, Email emailAddress)
    {
        Username = username;
        Password = password;
        EmailAddress = emailAddress;
    }
}