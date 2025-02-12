using System.Text.RegularExpressions;

namespace VibeTunes.Domain.ValueObjects;

public class Email
{
    private string EmailAddress { get; }

    public Email(string value)
    {
        if(string.IsNullOrWhiteSpace(value) || !Regex.IsMatch(value, @"^[^@\s]+@[^@\s]+\.[^@\s]+$")) 
            throw new ArgumentException($"'{value}' is not a valid email address.");
        EmailAddress = value;
    }
    
    public override string ToString() => EmailAddress;
}