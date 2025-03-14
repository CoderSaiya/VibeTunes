using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Infrastructure.Persistence.Data;
using System.Linq.Dynamic.Core;

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

    public async Task<IEnumerable<Album>> GetAlbumsByFilterAsync(AlbumFilter filter)
    {
        var query = context.Set<Album>()
            .Include(a => a.Artist)
            .ThenInclude(a => a.Profile)
            .Include(a => a.SongsList)
            .AsQueryable();
        
        if (!string.IsNullOrEmpty(filter.Keyword))
            query = query.Where(a => a.Title.Contains(filter.Keyword));
        
        if (!string.IsNullOrEmpty(filter.ByArtist))
        {
            var searchTerms = filter.ByArtist.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (searchTerms.Length == 1)
            {
                string term = searchTerms[0];
                query = query.Where(a => a.Artist.Profile.Name != null && 
                                         (EF.Functions.Like(a.Artist.Profile.Name.FirstName, $"%{term}%") ||
                                          EF.Functions.Like(a.Artist.Profile.Name.LastName, $"%{term}%")));
            }
            else if (searchTerms.Length == 2)
            {
                string firstTerm = searchTerms[0];
                string lastTerm = searchTerms[1];
                query = query.Where(a => a.Artist.Profile.Name != null && 
                                         (EF.Functions.Like(a.Artist.Profile.Name.FirstName, $"%{firstTerm}%") &&
                                          EF.Functions.Like(a.Artist.Profile.Name.LastName, $"%{lastTerm}%")));
            }
            else
            {
                foreach (var term in searchTerms)
                {
                    string currentTerm = term;
                    query = query.Where(a =>
                        a.Artist.Profile.Name != null && 
                        EF.Functions.Like(a.Artist.Profile.Name.FirstName + " " + a.Artist.Profile.Name.LastName, $"%{currentTerm}%"));
                }
            }
        }
        
        if (filter.MinReleaseDate.HasValue)
            query = query.Where(a => a.ReleaseDate >= filter.MinReleaseDate.Value);
        if (filter.MaxReleaseDate.HasValue)
            query = query.Where(a => a.ReleaseDate <= filter.MaxReleaseDate.Value);
        
        if (filter.MinStreams.HasValue)
            query = query.Where(a => a.Streams >= filter.MinStreams.Value);
        if (filter.MaxStreams.HasValue)
            query = query.Where(a => a.Streams <= filter.MaxStreams.Value);
        
        string orderByString = $"{filter.SortBy} {filter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);
        
        return await query.ToListAsync();
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