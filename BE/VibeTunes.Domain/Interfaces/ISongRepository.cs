using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Domain.Interfaces;

public interface ISongRepository
{
    public Task<IEnumerable<Song>> GetAllSongsAsync();
    public Task<IEnumerable<Song>> GetAllBannedSongsAsync();
    public Task<IEnumerable<Song>> GetAllActiveSongsAsync();
    public Task<IEnumerable<Song>> GetAllPendingSongsAsync();
    public Task<IEnumerable<Song>> GetSongByGenreAsync(Guid genreId);
    public Task<IEnumerable<Song>> GetSongByArtistAsync(Guid artistId);
    public Task<IEnumerable<Song>> GetSongByAlbumAsync(Guid albumId);
    public Task<IEnumerable<Song>> GetSongByPlaylistAsync(Guid playlistId);
    public Task<Song?> GetSongByIdAsync(Guid songId);
    Task<IEnumerable<Song>> GetSongsByIdsAsync(List<Guid> songIds);
    Task<IEnumerable<Song>> GetPopularSongsByArtistAsync(Guid artistId);
    public Task<IEnumerable<Song>> GetSongByFilterAsync(SongFilter songFilter);
    public Task AddSongAsync(Song song);
    public Task UpdateSongAsync(Song song); 
    public Task DeleteSongAsync(Song song);
}