namespace VibeTunes.Domain.ValueObjects;

public class Name
{
    public string FirstName { get; }
    public string LastName { get; }

    public Name(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Name fields cannot be empty.");
        }
        
        FirstName = firstName;
        LastName = lastName;
    }
}