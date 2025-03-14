namespace VibeTunes.Domain.Specifications;

public class SubscriptionFilter : GlobalFilter
{
    public string? Keyword { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
    public int? MinDuration { get; set; }
    public int? MaxDuration { get; set; }
    public string[]? Tags { get; set; }
    public string[]? Benefits { get; set; }
}