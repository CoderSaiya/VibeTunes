using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class SongLog : BaseEntity
{
    public Guid SongId { get; set; }
    [ForeignKey("SongId")] 
    public Song Song { get; set; } = null!;

    public int ViewCount { get; set; } = 1;
}