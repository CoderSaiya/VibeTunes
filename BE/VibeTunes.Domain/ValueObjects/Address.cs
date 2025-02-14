namespace VibeTunes.Domain.ValueObjects;

public class Address
{
    public string Street { get; }
    public string City { get; }
    public string Country { get; }

    public Address(string street, string city, string country)
    {
        if (string.IsNullOrWhiteSpace(street) || string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(country))
        {
            throw new ArgumentException("Address fields cannot be empty.");
        }

        Street = street;
        City = city;
        Country = country;
    }

    public override string ToString() => $"{Street}, {City}, {Country}";
}