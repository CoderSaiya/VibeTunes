namespace VibeTunes.Domain.ValueObjects;

public class Address
{
    public string Street { get; }
    public string District { get; }
    public string City { get; }
    public string Country { get; }

    public Address(string street, string district, string city, string country)
    {
        if (string.IsNullOrWhiteSpace(street) || 
            string.IsNullOrWhiteSpace(district) || 
            string.IsNullOrWhiteSpace(city) || 
            string.IsNullOrWhiteSpace(country))
        {
            throw new ArgumentException("Address fields cannot be empty.");
        }

        Street = street;
        District = district;
        City = city;
        Country = country;
    }

    public override string ToString() => $"{Street}, {District}, {City}, {Country}";

    public static Address Parse(string addressString)
    {
        if (string.IsNullOrWhiteSpace(addressString))
            throw new ArgumentException("Address cannot be empty.");

        var parts = addressString.Split(',', StringSplitOptions.TrimEntries);
        var n = parts.Length;
        
        if (n < 4)
            throw new ArgumentException("Invalid address format. Expected format: '123 ABC Street, Ward X, Y District, Z City, Nation'.");

        string country = parts[n - 1];
        string city = parts[n - 2];
        string district = parts[n - 3];
        string street = string.Join(", ", parts.Take(n - 3));
        
        return new Address(street, district, city, country);
    }
}