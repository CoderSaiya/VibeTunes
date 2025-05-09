using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Interfaces;

public interface IStatisticsRepository
{
    Task<int> GetTotalCountAsync<TEntity>(CancellationToken ct)
        where TEntity : BaseEntity;
    
    Task<int> GetCountByDateRangeAsync<TEntity>(
        DateTime start, DateTime end, CancellationToken ct)
        where TEntity : BaseEntity;
}