namespace VibeTunes.Domain.Common;

public class EntityStatistics
{
    public string EntityName { get; init; } = default!;
    public int TotalCount { get; init; }
    public int CurrentMonthCount { get; init; }
    public int PreviousMonthCount { get; init; }
    public int Difference
    {
        get
        {
            if (PreviousMonthCount == 0)
            {
                return CurrentMonthCount == 0 ? 0 : 100;
            }
            
            var change = ((double)CurrentMonthCount - PreviousMonthCount) / PreviousMonthCount * 100;
            return (int)Math.Round(change, MidpointRounding.AwayFromZero);
        }
    }
}