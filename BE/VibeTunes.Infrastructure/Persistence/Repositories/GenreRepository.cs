using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Infrastructure.Persistence.Data;
using System.Linq.Dynamic.Core;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class GenreRepository(AppDbContext context) : IGenreRepository
{
    public async Task<IEnumerable<Genre>> GetAllGenresAsync()
    {
        return await context.Genres.ToListAsync();
    }

    public async Task<Genre?> GetGenreByNameAsync(string genreName)
    {
        return await context.Genres.FirstOrDefaultAsync(x => x.GenreName == genreName);
    }

    public async Task<List<Genre>> GetGenreByNameAsync(IEnumerable<string> names)
    {
        var enumerable = names as string[] ?? names.ToArray();
        
        var lowerName = enumerable.Select(n => n.ToLower()).ToList();
        
        return await context.Genres
            .Where(g => lowerName.Contains(g.GenreName))
            .ToListAsync();
    }
    
    public async Task<Genre?> GetGenreByIdAsync(Guid id)
    {
        return await context.Genres.FindAsync(id);
    }

    public async Task<IEnumerable<Genre>> GetGenresByArtistIdAsync(Guid artistId)
    {
        return await context.Genres
            .Where(g => g.Songs.Any(s => s.ArtistId == artistId))
            .Distinct()
            .ToListAsync();
    }

    public async Task<IEnumerable<Genre>> GetGenresByFilterAsync(GlobalFilter filter)
    {
        IQueryable<Genre> query = context.Genres
            .AsQueryable();
        
        string orderByString = $"{filter.SortBy} {filter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);
        
        return await query.ToListAsync();
    }

    public async Task<bool> CreateGenreAsync(Genre genre)
    {
        if (await context.Genres.AnyAsync(x => x.GenreName == genre.GenreName))
            return false;
        
        try
        {
            await context.Genres.AddAsync(genre);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateGenreAsync(Genre genre)
    {
        var existingGenre = await context.Genres.FindAsync(genre.Id);
        if (existingGenre == null)
            return false;
        
        context.Entry(existingGenre).CurrentValues.SetValues(genre);
        return true;
    } 

    public async Task<bool> DeleteGenreByIdAsync(Guid genreId)
    {
        var existingGenre = await context.Genres.FindAsync(genreId);
        if (existingGenre == null)
            return false;
        
        context.Genres.Remove(existingGenre);
        return true;
    }

    public async Task<bool> DeleteGenreByNameAsync(string genreName)
    {
        var existingGenre = await context.Genres
            .Where(g => g.GenreName == genreName)
            .FirstOrDefaultAsync();
        if (existingGenre == null)
            return false;
        
        context.Genres.Remove(existingGenre);
        return true;
    }
}