using Microsoft.AspNetCore.Http;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.DTOs;

public record SongDto(
    Guid Id,
    string? Title,
    string? ArtistName,
    string? Genre,
    TimeSpan? Duration,
    string? FileUrl,
    string? CoverImgUrl,
    int? Streams,
    SongStatus? Status,
    DateTime? ReleaseDate = null,
    IFormFile? Audio = null,
    IFormFile? Image = null);