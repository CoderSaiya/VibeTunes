namespace VibeTunes.Application.DTOs;

public record PlaylistDto(
    Guid Id,
    Guid UserId,
    string Name,
    string Description,
    string CoverImageUrl,
    int Likes,
    List<SongDto> SongsList,
    string CreatedDate
    );