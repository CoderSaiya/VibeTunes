using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class SongLogRepository(AppDbContext context) : ISongLogRepository
{
    public async Task<IEnumerable<SongLog>> GetHotScore()
    {
        var today = DateTime.UtcNow.ToLocalTime().Date;
        var yesterday = today.AddDays(-1);
        
        return await context.SongLogs
            .Where(a => a.CreatedDate.Date == today || a.CreatedDate.Date == yesterday)
            .GroupBy(a => a.SongId)
            .OrderByDescending(g => g.Sum(x => x.CreatedDate == today ? x.ViewCount * 1.0 : x.ViewCount * 0.5))
            .SelectMany(g => g)
            .ToListAsync();
    }

    public async Task IncrementOrCreateSongLogAsync(Guid songId)
    {
        var today = DateTime.UtcNow.ToLocalTime().Date;
        
        var existingLog = await context.SongLogs
            .FirstOrDefaultAsync(sl => 
                sl.SongId == songId && 
                sl.CreatedDate.Date == today
            );
        
        if (existingLog != null)
        {
            existingLog.ViewCount++;
            existingLog.ModifiedDate = DateTime.UtcNow;
        }
        else
        {
            var newLog = new SongLog
            {
                SongId = songId,
            };
            await context.SongLogs.AddAsync(newLog);
        }

    }
}