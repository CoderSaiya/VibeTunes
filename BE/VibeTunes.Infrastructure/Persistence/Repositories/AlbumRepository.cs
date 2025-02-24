using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class AlbumRepository(AppDbContext context) : IAlbumRepository
{
    public async Task<IEnumerable<Album>> GetAllAlbumsAsync()
    {
        return await context.Albums.ToListAsync();
    }

    public async Task<Album?> GetAlbumByIdAsync(Guid id)
    {
        return await context.Albums.FindAsync(id);
    }

    public async Task<IEnumerable<Album>> GetAlbumsByArtistIdAsync(Guid artistId)
    {
        return await context.Albums
            .Where(a => a.ArtistId == artistId)
            .ToListAsync();
    }

    public async Task<Album?> GetAlbumsBySongIdAsync(Guid songId)
    {
        return await context.Albums
            .Where(a => a.SongsList.Any(s => s.Id == songId))
            .FirstOrDefaultAsync();
    }

    public async Task<bool> CreateAlbumAsync(Album album)
    {
        try
        {
            await context.Albums.AddAsync(album);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateAlbumAsync(Album album)
    {
        var existingAlbum = await context.Albums.FindAsync(album.Id);
        if (existingAlbum == null)
            return false;
        
        context.Entry(existingAlbum).CurrentValues.SetValues(album);
        return true;
    }

    public async Task<bool> AddSongToAlbumAsync(Guid albumId, Guid songId)
    {
        var existingAlbum = await context.Albums.
                Include(a => a.SongsList).
                FirstOrDefaultAsync(a => a.Id == albumId);
        
        var existingSong = await context.Songs.FindAsync(songId);

        if (existingSong == null || existingAlbum == null)
            return false;
        
        if (existingAlbum.SongsList.Any(s => s.Id == songId))
            return false;
        
        existingAlbum.SongsList.Add(existingSong);
        return true;
    }

    public async Task<bool> DeleteAlbumAsync(Album album)
    {
        var existingAlbum = await context.Albums.FindAsync(album.Id);
        if (existingAlbum == null)
            return false;
        
        context.Albums.Remove(existingAlbum);
        return true;
    }

    public async Task<bool> DeleteSongFromAlbumAsync(Guid albumId, Guid songId)
    {
        var existingAlbum = await context.Albums.
            Include(a => a.SongsList).
            FirstOrDefaultAsync(a => a.Id == albumId);
        
        var existingSong = await context.Songs.FindAsync(songId);
        
        if (existingSong == null || existingAlbum == null)
            return false;
        
        if (existingAlbum.SongsList.Any(s => s.Id == songId))
            return false;
        
        existingAlbum.SongsList.Remove(existingSong);
        return true;
    }
}