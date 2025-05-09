using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Domain.ValueObjects;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class HistoryRepository(AppDbContext context) : IHistoryRepository
{
    public async Task<IEnumerable<History>> GetAllHistoriesAsync()
    {
        return await context.Histories.ToListAsync();
    }

    public async Task<IEnumerable<History>> GetHistoriesByUserIdAsync(Guid userId)
    {
        return await context.Histories
            .Where(h => h.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<History>> GetHistoryBySongIdAsync(Guid songId)
    {
        return await context.Histories
            .Where(h => h.SongId == songId)
            .ToListAsync();
    }

    public async Task<History?> GetHistoryByIdAsync(Guid historyId)
    {
        return await context.Histories.FindAsync(historyId);
    }

    public async Task<IEnumerable<Song>> GetHistoriesByFilter(HistoryFilter filter)
    {
        IQueryable<History> historyQuery = context.Histories
            .Include(h => h.Song)
            .ThenInclude(s => s.Artist)
            .AsQueryable();
        
        if (filter.UserId.HasValue) 
            historyQuery = historyQuery.Where(h => h.UserId == filter.UserId);
        
        var songQuery = historyQuery.Select(h => h.Song).Distinct();
        
        string orderByString = $"{filter.SortBy} {filter.SortDirection}";
        Console.WriteLine("ABC: " + orderByString);
        songQuery = songQuery.OrderBy(orderByString);
        
        
        songQuery = songQuery.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);
        
        return await songQuery.ToListAsync();
    }

    public async Task<IEnumerable<GenreCount>> GetTopGenresByUserAsync(Guid userId, int topN = 5)
    {
        return await context.Histories
            .AsNoTracking()
            .Where(h => h.UserId == userId)
            .SelectMany(h => h.Song.Genres, 
                (h, g) => new { g.GenreName })
            .GroupBy(x => x.GenreName)
            .Select(gr => new GenreCount
            {
                GenreName = gr.Key,
                Count = gr.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(topN)
            .ToListAsync();
    }

    public async Task<bool> CreateHistoryAsync(History history)
    {
        try
        {
            await context.Histories.AddAsync(history);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateHistoryAsync(History history)
    {
        var existingHistory = await context.Histories.FindAsync(history.Id);
        if (existingHistory == null)
            return false;
        
        context.Entry(existingHistory).CurrentValues.SetValues(existingHistory);
        return true;
    }

    public async Task<bool> DeleteHistoryByIdAsync(Guid historyId)
    {
        var existingHistory = await context.Histories.FindAsync(historyId);
        if (existingHistory == null)
            return false;
        
        context.Histories.Remove(existingHistory);
        return true;
    }

    public async Task<bool> DeleteHistoryBySongIdAsync(Guid songId)
    {
        var existingHistories = await context.Histories
            .Where(h => h.SongId == songId)
            .ToListAsync();
        if (!existingHistories.Any())
            return false;
        
        foreach (var history in existingHistories)
            context.Histories.Remove(history);
        
        return true;
    }

    public async Task<bool> DeleteHistoryByUserIdAsync(Guid userId)
    {
        var existingHistories = await context.Histories
            .Where(h => h.UserId == userId)
            .ToListAsync();
        if (!existingHistories.Any())
            return false;
        
        foreach (var history in existingHistories)
            context.Histories.Remove(history);
        
        return true;
    }
}