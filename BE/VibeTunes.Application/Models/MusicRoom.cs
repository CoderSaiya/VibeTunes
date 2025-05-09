using VibeTunes.Domain.Entities;

namespace VibeTunes.Application.Models;

public sealed record MusicRoom(
    Guid RoomId,
    Guid HostId,
    string Name,
    List<Guid> Participants,
    Song? CurrentSong,
    PlaybackState PlaybackState
)
{
    public double CurrentTime { get; set; }
}