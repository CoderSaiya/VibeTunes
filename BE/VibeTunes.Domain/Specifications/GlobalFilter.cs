namespace VibeTunes.Domain.Specifications;

public class GlobalFilter
{
    public string SortBy { get; init; } = "Title";
    public string SortDirection { get; init; } = "asc";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}