using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Genres.Commands;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenreController(IMediator mediator) : Controller
{
    [HttpPost]
    public async Task<IActionResult> AddGenre([FromBody] AddGenreCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var genreId = await mediator.Send(command);
            Console.WriteLine(genreId);
            return CreatedAtAction(nameof(AddGenre), GlobalResponse<Guid>.Success(genreId));
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