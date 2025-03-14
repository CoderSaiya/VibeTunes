using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Specifications;

public class TransactionFilter : GlobalFilter
{
    public double? MinAmount { get; set; }
    public double? MaxAmount { get; set; }
    public string? Currency { get; set; }
    public string? PaymentMethod { get; set; }
    public TransactionStatus? Status { get; set; }
}