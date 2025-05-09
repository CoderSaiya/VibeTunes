using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Admin : User
{
    protected Admin() {}
    
    public Admin(string username, string password, Email emailAddress)
    {
        Username = username;
        Password = password;
        EmailAddress = emailAddress;
    }
}