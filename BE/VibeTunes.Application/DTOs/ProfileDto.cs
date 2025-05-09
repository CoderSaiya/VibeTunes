using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.DTOs;

public record ProfileDto(
    Name Name, 
    string? StageName, 
    string? Bio, 
    Address? Address, 
    Gender? Gender, 
    string? Avatar, 
    double? Followers, 
    double Following,
    List<SongDto> LatestSong,
    List<string> TopGenres);