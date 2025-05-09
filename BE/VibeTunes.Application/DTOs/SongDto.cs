namespace VibeTunes.Application.DTOs;

public record SongDto(
    Guid Id,
    string? Title,
    object? Artist,
    string? Genre,
    string? Duration,
    string? FileUrl,
    string? CoverImgUrl,
    int? Streams,
    string? Status,
    string? CreatedAt,
    string? AlbumTitle = null,
    string? ReleaseDate = null);