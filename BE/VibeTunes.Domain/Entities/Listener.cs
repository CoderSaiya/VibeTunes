using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public class Listener(string username, string password, Email emailAddress) : User(username, password, emailAddress);