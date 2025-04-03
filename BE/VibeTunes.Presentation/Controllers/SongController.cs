using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Application.UseCases.Songs.Queries;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongController(IMediator mediator) : Controller
{
    [HttpPost()]
    public async Task<IActionResult> CreateSong([FromForm] CreateSongCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var songId = await mediator.Send(command);
            Console.WriteLine(songId);
            return CreatedAtAction(nameof(CreateSong), GlobalResponse<Guid>.Success(data: songId, message: "Created successfully"));
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

    [HttpGet("stream")]
    public async Task<IActionResult> GetSongStreamAsync([FromQuery] GetSongStreamQuery query)
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
            
            var fileStream = await mediator.Send(query);
            if (fileStream is null)
                return NotFound("File not found on S3!");
            Console.WriteLine(fileStream);
            
            return Ok(GlobalResponse<string>.Success(data: fileStream));
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