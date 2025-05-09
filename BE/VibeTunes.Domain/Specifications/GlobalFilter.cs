namespace VibeTunes.Domain.Specifications;

public class GlobalFilter
{
    public string? SortBy { get; init; } = "CreatedDate";
    public string SortDirection { get; init; } = "desc";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}