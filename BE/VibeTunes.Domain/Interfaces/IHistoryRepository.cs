using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface IHistoryRepository
{
    public Task<IEnumerable<History>> GetAllHistoriesAsync();
    public Task<IEnumerable<History>> GetHistoriesByUserIdAsync(Guid userId);
    public Task<IEnumerable<History>> GetHistoryBySongIdAsync(Guid songId);
    public Task<History?> GetHistoryByIdAsync(Guid historyId);
    public Task<bool> CreateHistoryAsync(History history);
    public Task<bool> UpdateHistoryAsync(History history);
    public Task<bool> DeleteHistoryByIdAsync(Guid historyId);
    public Task<bool> DeleteHistoryBySongIdAsync(Guid songId);
    public Task<bool> DeleteHistoryByUserIdAsync(Guid userId);
    
}