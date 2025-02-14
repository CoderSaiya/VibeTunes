using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public sealed class Notification : BaseEntity
{
    public Guid SenderId { get; set; }
    [ForeignKey("SenderId")]
    public User Sender { get; set; }
    
    public Guid ReceiverId { get; set; }
    [ForeignKey("ReceiverId")]
    public User Receiver { get; set; }
    
    public string Message { get; set; } = "";
    public bool? IsRead { get; set; } = false;
}