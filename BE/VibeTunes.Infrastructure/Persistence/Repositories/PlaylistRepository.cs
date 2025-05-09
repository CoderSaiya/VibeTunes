using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Infrastructure.Persistence.Data;
using System.Linq.Dynamic.Core;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class PlaylistRepository(AppDbContext context) : IPlaylistRepository
{
    public async Task<IEnumerable<Playlist>> GetAllPlaylistsAsync()
    {
        return await context.Playlists.ToListAsync();
    }

    public async Task<IEnumerable<Playlist>> GetAllPlaylistsAsync(bool isPublic)
    {
        return await context.Playlists
            .Where(p => isPublic == p.IsPublic)
            .ToListAsync();
    }

    public async Task<Playlist?> GetPlaylistByIdAsync(Guid playlistId)
    {
        return await context.Playlists
            .Include(p => p.Songs)
            .Where(p => p.Id == playlistId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId)
    {
        return await context.Playlists
            .Include(p => p.Songs)
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId, bool isPublic)
    {
        return await context.Playlists
            .Where(p => p.UserId == userId && p.IsPublic == isPublic)
            .ToListAsync();
    }

    public async Task<IEnumerable<Playlist>> GetPlaylistsByFilterAsync(PlaylistFilter filter)
    {
        IQueryable<Playlist> query = context.Playlists
            .Include(p => p.Songs)
            .AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
            query = query.Where(s => EF.Functions.Like(s.Name, $"%{filter.Keyword}%") ||
                                            EF.Functions.Like(s.Description, $"%{filter.Keyword}%"));

        query = query.Where(p => p.IsPublic == filter.IsPublic);
        
        string orderByString = $"{filter.SortBy} {filter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);
        
        return await query.ToListAsync();
    }

    public async Task<bool> CreatePlaylistAsync(Playlist playlist)
    {
        try
        {
            await context.Playlists.AddAsync(playlist);
            return true;
        }
        catch
        {
            return false;
        }
    }
    
    public async Task<bool> AddSongsAsync(Guid playlistId, List<Guid> songIds)
    {
        try
        {
            var playlist = await context.Playlists
                .Include(p => p.Songs)
                .FirstOrDefaultAsync(p => p.Id == playlistId);
            
            var songsToAdd = await context.Songs
                .Where(s => songIds.Contains(s.Id))
                .ToListAsync();

            if (playlist is null || !songsToAdd.Any())
                return false;
            
            foreach (var song in songsToAdd)
            {
                if (playlist.Songs.All(existing => existing.Id != song.Id))
                {
                    playlist.Songs.Add(song);
                }
            }
            
            return true;
        }
        catch
        {
            return false;
        }
    }
    
    public async Task<bool> RemoveSongsAsync(Guid playlistId, List<Guid> songIds)
    {
        try
        {
            var playlist = await context.Playlists
                .Include(p => p.Songs)
                .FirstOrDefaultAsync(p => p.Id == playlistId);
            
            var songsToRemove = await context.Songs
                .Where(s => songIds.Contains(s.Id))
                .ToListAsync();

            if (playlist is null || !songsToRemove.Any())
                return false;
            
            foreach (var song in songsToRemove)
            {
                playlist.Songs.Remove(song);
            }
            
            return true;
        }
        catch
        {
            return false;
        }
    }
    
    public async Task<bool> UpdatePlaylistAsync(Playlist playlist)
    {
        var existingPlaylist = await context.Playlists.FindAsync(playlist.Id);
        if (existingPlaylist == null)
            return false;
        
        context.Entry(existingPlaylist).CurrentValues.SetValues(playlist);
        return true;
    }

    public async Task<bool> AddSongAsync(Guid playlistId, Guid songId)
    {
        var existingPlaylist = await context.Playlists.
            Include(a => a.Songs).
            FirstOrDefaultAsync(a => a.Id == playlistId);
        
        var existingSong = await context.Songs.FindAsync(songId);

        if (existingSong == null || existingPlaylist == null)
            return false;
        
        if (existingPlaylist.Songs.Any(s => s.Id == songId))
            return false;
        
        existingPlaylist.Songs.Add(existingSong);
        return true;
    }

    public async Task<bool> DeletePlaylistAsync(Guid playlistId)
    {
        var existingPlaylist = await context.Playlists.FindAsync(playlistId);
        if (existingPlaylist == null)
            return false;
        
        context.Playlists.Remove(existingPlaylist);
        return true;
    }

    public async Task<bool> DeleteSongAsync(Guid playlistId, Guid songId)
    {
        var existingPlaylist = await context.Playlists.
            Include(a => a.Songs).
            FirstOrDefaultAsync(a => a.Id == playlistId);
        
        var existingSong = await context.Songs.FindAsync(songId);

        if (existingSong == null || existingPlaylist == null)
            return false;
        
        if (existingPlaylist.Songs.Any(s => s.Id == songId))
            return false;
        
        existingPlaylist.Songs.Remove(existingSong);
        return true;
    }
}