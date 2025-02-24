using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface IPlaylistRepository
{
    public Task<IEnumerable<Playlist>> GetAllPlaylistsAsync();
    public Task<IEnumerable<Playlist>> GetAllPlaylistsAsync(bool isPublic);
    public Task<Playlist?> GetPlaylistByIdAsync(Guid playlistId);
    public Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId);
    public Task<IEnumerable<Playlist>> GetPlaylistsByUserIdAsync(Guid userId, bool isPublic);
    public Task<bool> CreatePlaylistAsync(Playlist playlist);
    public Task<bool> UpdatePlaylistAsync(Playlist playlist);
    public Task<bool> AddSongAsync(Guid playlistId, Guid songId);
    public Task<bool> DeletePlaylistAsync(Guid playlistId);
    public Task<bool> DeleteSongAsync(Guid playlistId, Guid songId);
}