using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Authentication.Commands;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : Controller
{
    [HttpPost("sign-up")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userId = await mediator.Send(command);
            Console.WriteLine(userId);
            return CreatedAtAction(nameof(Register), GlobalResponse<Guid>.Success(data: userId));
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

    [HttpPost("sign-in")]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await mediator.Send(command);
            return Ok(GlobalResponse<TokenDto>.Success(new TokenDto(result.AccessToken, result.RefreshToken)));
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

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(RefreshTokenCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await mediator.Send(command);
            return Ok(GlobalResponse<string>.Success(result));
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

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await mediator.Send(command);
            return Ok(GlobalResponse<string>.Success(result));
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