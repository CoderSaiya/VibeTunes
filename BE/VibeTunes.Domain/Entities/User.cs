using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; }
    public string Password {get; set;}
    public Email EmailAddress {get; set;}
    public bool IsActive { get; set; } = false;
    public string ActiveCode {get; set;} = string.Empty!;
    
    private User() {}

    public User(string username, string password, Email emailAddress)
    {
        Username = username;
        Password = password;
        EmailAddress = emailAddress;
    }
}