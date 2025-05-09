using MediatR;
using Microsoft.AspNetCore.Http;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Songs.Commands;

public record UpdateSongCommand(
    Guid Id,
    string? Title = null,
    object? Artist = null,
    string? Genre = null,
    TimeSpan? Duration = null,
    string? FileUrl = null,
    string? CoverImgUrl = null,
    int? Streams = null,
    SongStatus? Status = null,
    DateTime? ReleaseDate = null,
    IFormFile? Image = null,
    IFormFile? Audio = null
    ) : IRequest<Unit>;