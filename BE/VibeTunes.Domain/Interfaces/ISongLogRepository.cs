using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface ISongLogRepository
{
    Task<IEnumerable<SongLog>> GetHotScore();
    Task IncrementOrCreateSongLogAsync(Guid songId);
}