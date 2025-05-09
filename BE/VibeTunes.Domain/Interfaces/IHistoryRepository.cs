using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Interfaces;

public interface IHistoryRepository
{
    public Task<IEnumerable<History>> GetAllHistoriesAsync();
    public Task<IEnumerable<History>> GetHistoriesByUserIdAsync(Guid userId);
    public Task<IEnumerable<History>> GetHistoryBySongIdAsync(Guid songId);
    public Task<History?> GetHistoryByIdAsync(Guid historyId);
    public Task<IEnumerable<Song>> GetHistoriesByFilter(HistoryFilter filter);
    public Task<IEnumerable<GenreCount>> GetTopGenresByUserAsync(Guid userId, int topN = 5);
    public Task<bool> CreateHistoryAsync(History history);
    public Task<bool> UpdateHistoryAsync(History history);
    public Task<bool> DeleteHistoryByIdAsync(Guid historyId);
    public Task<bool> DeleteHistoryBySongIdAsync(Guid songId);
    public Task<bool> DeleteHistoryByUserIdAsync(Guid userId);
    
}