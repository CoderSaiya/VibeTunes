using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public sealed class Song : BaseEntity
{
    public Guid ArtistId { get; set; }
    [ForeignKey("ArtistId")]
    public Artist Artist { get; set; } = null!;
    
    public Guid? AlbumId { get; set; }
    [ForeignKey("AlbumId")]
    public Album? Album { get; set; } = null!;

    public string Title { get; set; }
    public TimeSpan Duration { get; set; }
    public string FileUrl { get; set; }
    public string CoverImgUrl { get; set; }
    public int Streams { get; set; } = 0;
    public DateTime ReleaseDate { get; set; }
    public SongStatus Status { get; set; } = SongStatus.Pending;

    public ICollection<Genre> Genres { get; set; } = new List<Genre>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
}