namespace VibeTunes.Application.DTOs;

public sealed record AlbumDto(
    Guid Id,
    Guid ArtistId,
    string ArtistName,
    string Title,
    string ReleaseDate,
    int Streams,
    string CoverImgUrl,
    bool IsReleased,
    List<SongDto> SongsList,
    string? TopGenre = null
)
{
    public int SongCount => SongsList?.Count ?? 0;
}