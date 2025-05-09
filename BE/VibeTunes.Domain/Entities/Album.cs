using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class Album : BaseEntity
{
    public Guid ArtistId { get; set; }
    [ForeignKey("ArtistId")]
    public Artist Artist { get; set; }
    
    public string Title {get; set;}
    public DateOnly ReleaseDate {get; set;}
    public int Streams { get; set; } = 0;
    public string CoverImgUrl {get; set;}
    public bool IsReleased { get; set; } = false;
    
    public ICollection<Song> SongsList { get; set; } = new List<Song>();
}