using Microsoft.ML.Data;

namespace VibeTunes.Domain.Models;

public class SongRating
{
    [LoadColumn(0)]
    public float UserId { get; set; }
    [LoadColumn(1)]
    public float SongId { get; set; }
    [LoadColumn(2)]
    public float ListenDuration { get; set; }
}