using VibeTunes.Domain.Common;

namespace VibeTunes.Application.DTOs;

public record StatisticsDto(
    EntityStatistics Users = default!, 
    EntityStatistics Artists = default!, 
    EntityStatistics Songs = default!, 
    EntityStatistics Playlists = default!
    );