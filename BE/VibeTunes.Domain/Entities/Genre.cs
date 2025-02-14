using System.ComponentModel.DataAnnotations;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class Genre : BaseEntity
{
    [Required]
    public string GenreName { get; set; }
    public string? GenreDescription { get; set; }

    public ICollection<Song> Songs { get; set; } = new List<Song>();
}