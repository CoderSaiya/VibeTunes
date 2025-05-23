﻿using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Domain.ValueObjects;
using VibeTunes.Infrastructure.Persistence.Data;
using System.Linq.Dynamic.Core;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class SongRepository(AppDbContext context) : ISongRepository
{
    public async Task<IEnumerable<Song>> GetAllSongsAsync()
    {
        return await context.Songs
            .Include(s => s.Artist)
            .Include(s => s.Album)
            .Include(s => s.Genres)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetAllBannedSongsAsync()
    {
        return await context.Songs
            .Where(s => s.Status == SongStatus.Banned)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetAllActiveSongsAsync()
    {
        return await context.Songs
            .Where(s => s.Status == SongStatus.Active)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetAllPendingSongsAsync()
    {
        return await context.Songs
            .Where(s => s.Status == SongStatus.Pending)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetSongByGenreAsync(Guid genreId)
    {
        return await context.Songs
            .Where(s => s.Genres.Any(g => g.Id == genreId))
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetSongByArtistAsync(Guid artistId)
    {
        return await context.Songs
            .Where(s => s.ArtistId == artistId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetSongByAlbumAsync(Guid albumId)
    {
        return await context.Songs
            .Where(s => s.AlbumId == albumId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetSongByPlaylistAsync(Guid playlistId)
    {
        return await context.Songs
            .Where(s => s.Playlists.Any(p => p.Id == playlistId))
            .ToListAsync();
    }
    
    public async Task<Song?> GetSongByIdAsync(Guid songId)
    {
        return await context.Songs
            .Where(s => s.Id == songId)
            .Include(s => s.Genres)
            .Include(s => s.Artist)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Song>> GetSongsByIdsAsync(List<Guid> songIds)
    {
        return await context.Songs
            .Where(song => songIds.Contains(song.Id))
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetPopularSongsByArtistAsync(Guid artistId)
    {
        return await context.Songs
            .OrderByDescending(s => s.Streams)
            .Where(s => s.ArtistId == artistId)
            .Take(5)
            .ToListAsync();
    }

    public async Task<IEnumerable<Song>> GetSongByFilterAsync(SongFilter songFilter)
    {
        IQueryable<Song> query = context.Songs
            .Include(s => s.Artist)
            .Include(s => s.Album)
            .Include(s => s.Genres)
            .AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(songFilter.TitleContains))
            query = query.Where(s => s.Title.Contains(songFilter.TitleContains));
        
        if (!string.IsNullOrWhiteSpace(songFilter.Genre))
        {
            var genres = songFilter.Genre.Split(",").Select(g => g.Trim()).ToList();
            query = query.Where(s => s.Genres.Any(genre => genres.Contains(genre.GenreName)));
        }
        
        if (songFilter.MinDuration.HasValue)
            query = query.Where(s => s.Duration >= songFilter.MinDuration);
        if (songFilter.MaxDuration.HasValue)
            query = query.Where(s => s.Duration <= songFilter.MaxDuration);
        
        if (songFilter.ReleaseAfter.HasValue)
            query = query.Where(s => s.ReleaseDate >= songFilter.ReleaseAfter);
        if (songFilter.ReleaseBefore.HasValue)
            query = query.Where(s => s.ReleaseDate <= songFilter.ReleaseBefore);
        
        string orderByString = $"{songFilter.SortBy} {songFilter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((songFilter.PageNumber - 1) * songFilter.PageSize).Take(songFilter.PageSize);

        return await query.ToListAsync();
    }

    public async Task AddSongAsync(Song song)
    {
        await context.Songs.AddAsync(song);
    }

    public async Task UpdateSongAsync(Song song)
    {
        var existingSong = await context.Songs.FindAsync(song.Id);
        if (existingSong == null)
        {
            throw new KeyNotFoundException();
        }
        context.Entry(existingSong).CurrentValues.SetValues(song);
    }

    public Task DeleteSongAsync(Song song)
    {
        context.Songs.Remove(song);
        return Task.CompletedTask;
    }
}