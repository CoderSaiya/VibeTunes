using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class Playlist : BaseEntity
{
    public Guid UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    public string Name { get; set; }
    public string Description { get; set; }
    public string CoverImgUrl { get; set; }
    public int Likes { get; set; } = 0;
    public bool IsPublic { get; set; } = false;
    
    public ICollection<Song> Songs { get; set; } = new List<Song>();
}