namespace VibeTunes.Application.DTOs;

public sealed record RoomInfoDto(
    Guid RoomId,
    string Name,
    int ParticipantCount
    );