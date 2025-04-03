using VibeTunes.Domain.Entities;

namespace VibeTunes.Application.DTOs;

public record RecommendedSong(
    Guid Id,
    string Title,
    Artist Artist,
    float Score
);