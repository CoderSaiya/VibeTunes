namespace VibeTunes.Application.DTOs;

public class PaymentReq
{
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; }
    public Guid UserId { get; set; }
    public Guid SubscriptionId { get; set; }
}