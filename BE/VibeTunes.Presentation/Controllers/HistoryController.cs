using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Histories.Commands;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoryController(
    IMediator mediator
    ) : Controller
{
    [HttpPost("export")]
    public async Task<IActionResult> ExportHistory([FromBody] ExportUserHistoryCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var filePath = await mediator.Send(command);
            Console.WriteLine(filePath);
            return Ok(GlobalResponse<string>.Success(data: filePath));
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(500, new { error = $"An error occurred. Please try again later." });
        }
    }
}