namespace VibeTunes.Application.DTOs;

public record HotArtistDto(
    Guid Id,
    string Avatar,
    string Name,
    string TopGenre,
    int Followers,
    int Streams,
    int AlbumCount,
    int SongCount);