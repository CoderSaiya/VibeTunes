using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Domain.Interfaces;

public interface IGenreRepository
{
    public Task<IEnumerable<Genre>> GetAllGenresAsync();
    public Task<Genre?> GetGenreByNameAsync(string genreName);
    public Task<List<Genre>> GetGenreByNameAsync(IEnumerable<string> names);
    public Task<Genre?> GetGenreByIdAsync(Guid id);
    public Task<IEnumerable<Genre>> GetGenresByArtistIdAsync(Guid artistId);
    public Task<IEnumerable<Genre>> GetGenresByFilterAsync(GlobalFilter filter);
    public Task<bool> CreateGenreAsync(Genre genre);
    public Task<bool> UpdateGenreAsync(Genre genre);
    public Task<bool> DeleteGenreByIdAsync(Guid genreId);
    public Task<bool> DeleteGenreByNameAsync(string genreName);
}