namespace VibeTunes.Application.DTOs;

public sealed record ArtistDto(
    Guid Id,
    string StageName,
    string Avatar,
    int Followers,
    string Bio,
    List<SongDto> PopularSongs,
    List<AlbumDto> Albums
    );