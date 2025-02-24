﻿using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

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
        return await context.Playlists.FindAsync(playlistId);
    }

    public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId)
    {
        return await context.Playlists
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId, bool isPublic)
    {
        return await context.Playlists
            .Where(p => p.UserId == userId && p.IsPublic == isPublic)
            .ToListAsync();
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