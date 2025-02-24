using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface IAlbumRepository
{
    public Task<IEnumerable<Album>> GetAllAlbumsAsync();
    public Task<Album?> GetAlbumByIdAsync(Guid id);
    public Task<IEnumerable<Album>> GetAlbumsByArtistIdAsync(Guid artistId);
    public Task<Album?> GetAlbumsBySongIdAsync(Guid songId);
    public Task<bool> CreateAlbumAsync(Album album);
    public Task<bool> UpdateAlbumAsync(Album album);
    public Task<bool> AddSongToAlbumAsync(Guid albumId, Guid songId);
    public Task<bool> DeleteAlbumAsync(Album album);
    public Task<bool> DeleteSongFromAlbumAsync(Guid albumId, Guid songId);
}