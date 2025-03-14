using System.ComponentModel.DataAnnotations;

namespace VibeTunes.Domain.Common;

public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow.ToLocalTime();
    public DateTime ModifiedDate { get; set; } = DateTime.UtcNow.ToLocalTime();
}