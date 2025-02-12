using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class User : BaseEntity
{
    public string Password {get; set;}
    public Email EmailAddress {get; set;}
    public bool IsActive { get; set; } = false;
    public string ActiveCode {get; set;} = string.Empty!;
    
    private User() {}

    public User(string password, Email emailAddress)
    {
        Password = password;
        EmailAddress = emailAddress;
    }
}