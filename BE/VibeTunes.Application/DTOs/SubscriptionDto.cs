namespace VibeTunes.Application.DTOs;

public sealed record SubscriptionDto(
    string Name,
    int Price,
    int Duration,
    string[] Tags,
    string[] Benefits
    );