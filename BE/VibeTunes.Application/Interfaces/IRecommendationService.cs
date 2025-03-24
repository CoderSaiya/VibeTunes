namespace VibeTunes.Application.Interfaces;

public interface IRecommendationService
{
    Task TrainModelAsync();
    Task<List<float>> PredictAsync(float userId, List<float> songIds);
}