using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Statistics.Queries;
using VibeTunes.Application.UseCases.Users.Queries;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticsController(IMediator mediator) : Controller
{
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var result = await mediator.Send(new GetStatisticsQuery());
            Console.WriteLine(result);
            return Ok(GlobalResponse<StatisticsDto>.Success(data: result));
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

    [HttpGet("top-artists")]
    public async Task<IActionResult> GetTopArtists([FromQuery] GetHotArtistQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var result = await mediator.Send(query);
            Console.WriteLine(result);
            return Ok(GlobalResponse<IEnumerable<HotArtistDto>>.Success(data: result));
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
    
    [HttpGet("user-top-artists")]
    public async Task<IActionResult> GetUserArtistsDate([FromQuery] GetUserArtistStatisticsQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var result = await mediator.Send(query);
            Console.WriteLine(result);
            return Ok(GlobalResponse<IEnumerable<DateCountDto>>.Success(data: result));
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