using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    public Guid UserId { get; init; }
    [ForeignKey("UserId")]
    public User User { get; init; }
    
    public string Token { get; init; }
    public DateTime ExpiryDate  { get; init; }
    public bool? IsUsed { get; init; } = false;
    public bool? IsRevoked { get; init; } = false;
}