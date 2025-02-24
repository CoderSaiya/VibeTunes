using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    public Guid UserId { get; init; }
    [ForeignKey("UserId")]
    public User User { get; init; }
    
    public string Token { get; init; }
    public DateTime ExpiryDate  { get; set; }
    public bool? IsUsed { get; set; } = false;
    public bool? IsRevoked { get; set; } = false;
}