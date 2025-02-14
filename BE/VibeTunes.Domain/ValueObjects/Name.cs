namespace VibeTunes.Domain.ValueObjects;

public class Name
{
    public string FirstName { get; set; }
    public string LastName { get; set; }

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