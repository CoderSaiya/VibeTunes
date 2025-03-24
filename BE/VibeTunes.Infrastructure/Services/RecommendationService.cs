using Microsoft.Extensions.Configuration;
using Microsoft.ML;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Models;

namespace VibeTunes.Infrastructure.Services;

public class RecommendationService(
    IConfiguration configuration
    ) : IRecommendationService
{
    private readonly string _modelPath = $"{configuration["FilePath:Model"]!}/MLModel.zip";
    private readonly string _dataPath = $"{configuration["FilePath:Data"]!}/song-rating.csv";
    private readonly MLContext _mlContext = new MLContext();
    private ITransformer? _model;

    public async Task TrainModelAsync()
    {
        IDataView dataView = _mlContext.Data.LoadFromTextFile<SongRating>(
            path: _dataPath,
            hasHeader: true,
            separatorChar: ',');

        var options = new Microsoft.ML.Trainers.MatrixFactorizationTrainer.Options
        {
            MatrixColumnIndexColumnName = nameof(SongRating.UserId),
            MatrixRowIndexColumnName = nameof(SongRating.SongId),
            LabelColumnName = nameof(SongRating.ListenDuration),
            NumberOfThreads = 20,
            ApproximationRank = 100
        };
        
        var pipeline = _mlContext.Transforms.Conversion.MapValueToKey("UserId", "UserId")
            .Append(_mlContext.Transforms.Conversion.MapValueToKey("SongId", "SongId"))
            .Append(_mlContext.Recommendation().Trainers.MatrixFactorization(options));
        
        _model = pipeline.Fit(dataView);
        
        _mlContext.Model.Save(_model, dataView.Schema, _modelPath);
        await Task.CompletedTask;
    }

    public async Task<List<float>> PredictAsync(float userId, List<float> songIds)
    {
        if (_model is null)
        {
            await using var stream = new FileStream(_modelPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            _model = _mlContext.Model.Load(stream, out var modelSchema);
        }

        var predictionEngine = _mlContext.Model.CreatePredictionEngine<SongRating, SongRatingPrediction>(_model);
        var predictions = new List<float>();
        foreach (var songId in songIds)
        {
            var input = new SongRating
            {
                UserId = userId,
                SongId = songId
            };
            
            var prediction = predictionEngine.Predict(input);
            predictions.Add(prediction.Score);
        }
        return await Task.FromResult(predictions);
    }
}