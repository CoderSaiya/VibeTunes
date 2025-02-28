using System.Text.RegularExpressions;

namespace VibeTunes.Domain.ValueObjects;

public class Email
{
    public string Value { get; }

    public Email(string value)
    {
        if(string.IsNullOrWhiteSpace(value) || !Regex.IsMatch(value, @"^[^@\s]+@[^@\s]+\.[^@\s]+$")) 
            throw new ArgumentException($"'{value}' is not a valid email address.");
        Value = value;
    }
    
    public override string ToString() => Value;
}