﻿using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IMediator mediator) : Controller
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile([FromQuery] GetProfileQuery command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var profileDto = await mediator.Send(command);
            Console.WriteLine(profileDto);
            return Ok(GlobalResponse<ProfileDto>.Success(profileDto));
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

    [HttpPost("upgrade")]
    public async Task<IActionResult> Upgrade([FromForm] UpgradeArtistCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userId = await mediator.Send(command);
            Console.WriteLine(userId);
            return Ok(GlobalResponse<Guid>.Success(data: userId, message: "Upgraded successfully"));
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
    
    [HttpGet()]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userDto = await mediator.Send(query);
            Console.WriteLine(userDto);
            return Ok(GlobalResponse<IEnumerable<UserDto>>.Success(userDto));
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