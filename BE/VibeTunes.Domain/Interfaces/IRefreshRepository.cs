using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface IRefreshRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
}