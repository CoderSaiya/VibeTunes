using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class History : BaseEntity
{
    public Guid UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    public Guid SongId { get; set; }
    [ForeignKey("SongId")]
    public Song Song { get; set; }
    
    public float ListenDuration { get; set; }
}