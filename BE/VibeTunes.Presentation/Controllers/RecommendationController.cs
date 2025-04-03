using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationController(
    IRecommendationService recommendationService,
    ISongRepository songRepository
    ) : Controller
{
    [HttpPost("train")]
    public async Task<IActionResult> TrainModel()
    {
        await recommendationService.TrainModelAsync();
        return Ok("done");
    }

    [HttpGet()]
    public async Task<IActionResult> GetRecommendations([FromQuery] Guid userId)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var isRangeRequest = Request.Headers.ContainsKey("Range");
        
        try
        {
            if (!isRangeRequest)
            {
                Console.WriteLine("Initial stream request");
            }
            
            var songs = await songRepository.GetAllSongsAsync();
            var enumerable = songs as Song[] ?? songs.ToArray();
            if (!enumerable.Any())
            {
                return NotFound("No songs available.");
            }
            
            var songIds = enumerable.Select(s => GuidConverter.ToFloat(s.Id)).ToList();
            
            var predictions = await recommendationService.PredictAsync(GuidConverter.ToFloat(userId), songIds);
            
            var recommendedSongs = enumerable
                .Zip(predictions, (song, score) => new RecommendedSong(
                    song.Id, 
                    song.Title, 
                    song.Artist, 
                    float.IsInfinity(score) ? 0 : score))
                .OrderByDescending(rs => rs.Score)
                .ToList();
            
            return Ok(GlobalResponse<List<RecommendedSong>>.Success(data: recommendedSongs));
        }
        catch (BusinessException ex)
        {
            return BadRequest(GlobalResponse<string>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(500, GlobalResponse<string>.Error("An error occurred. Please try again later.", 500));
        }
    }
}