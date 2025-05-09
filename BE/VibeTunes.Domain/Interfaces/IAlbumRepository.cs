﻿using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Interfaces;

public interface IAlbumRepository
{
    public Task<IEnumerable<Album>> GetAllAlbumsAsync();
    public Task<Album?> GetAlbumByIdAsync(Guid id);
    public Task<IEnumerable<Album>> GetAlbumsByArtistIdAsync(Guid artistId);
    public Task<Album?> GetAlbumsBySongIdAsync(Guid songId);
    public Task<IEnumerable<Album>> GetAlbumsByFilterAsync(AlbumFilter filter);
    Task<IEnumerable<GenreCount>> GetTopGenresAsync(Guid albumId, int top = 1);
    public Task<bool> CreateAlbumAsync(Album album);
    public Task<bool> UpdateAlbumAsync(Album album);
    public Task<bool> AddSongToAlbumAsync(Guid albumId, Guid songId);
    public Task<bool> DeleteAlbumAsync(Album album);
    public Task<bool> DeleteSongFromAlbumAsync(Guid albumId, Guid songId);
}