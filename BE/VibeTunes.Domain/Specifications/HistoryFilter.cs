namespace VibeTunes.Domain.Specifications;

public class HistoryFilter : GlobalFilter
{
    public Guid? UserId { get; set; }
}