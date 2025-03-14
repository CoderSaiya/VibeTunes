using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public sealed class Transaction : BaseEntity
{
    public Guid UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    public Guid SubscriptionId { get; set; }
    [ForeignKey("SubscriptionId")]
    public Subscription Subscription { get; set; }
    
    public double Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; }
    public TransactionStatus Status { get; set; }
}