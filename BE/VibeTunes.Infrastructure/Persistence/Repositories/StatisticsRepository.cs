using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class StatisticsRepository(AppDbContext context) : IStatisticsRepository
{
    public Task<int> GetTotalCountAsync<TEntity>(CancellationToken ct) where TEntity : BaseEntity
    {
        return context.Set<TEntity>().CountAsync(ct);
    }

    public Task<int> GetCountByDateRangeAsync<TEntity>(DateTime start, DateTime end, CancellationToken ct) where TEntity : BaseEntity
    {
        return context.Set<TEntity>()
            .Where(e => e.CreatedDate >= start && e.CreatedDate < end)
            .CountAsync(ct);
    }
}