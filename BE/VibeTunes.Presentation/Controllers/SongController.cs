﻿using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Songs.Commands;
using VibeTunes.Application.UseCases.Songs.Queries;
using VibeTunes.Domain.Entities;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongController(IMediator mediator) : Controller
{
    [HttpPost]
    [Consumes("multipart/form-data")]
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
    
    [HttpPost("log")]
    public async Task<IActionResult> LogSong([FromBody] LogSongCommand command)
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
            
            var views = await mediator.Send(command);
            Console.WriteLine(views);
            
            return Ok(GlobalResponse<string>.Success(data: $"Song views: {views}"));
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
    
    [HttpGet]
    public async Task<IActionResult> GetSongs([FromQuery] GetSongsQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var songs = await mediator.Send(query);
            
            return Ok(GlobalResponse<IEnumerable<object>>.Success(data: songs));
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

    [HttpGet("artist")]
    public async Task<IActionResult> GetSongsByArtist([FromQuery] GetSongByArtistQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var songs = await mediator.Send(query);
            Console.WriteLine(songs);
            return Ok(GlobalResponse<IEnumerable<SongDto>>.Success(data: songs));
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
    
    [HttpGet("recommend")]
    public async Task<IActionResult> GetArtistProfile([FromQuery] GetRecommendSongQuery command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var songDto = await mediator.Send(command);
            Console.WriteLine(songDto);
            return Ok(GlobalResponse<IEnumerable<SongDto>>.Success(songDto));
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

    [HttpDelete]
    public async Task<IActionResult> DeleteSong([FromQuery] DeleteSongCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var result = await mediator.Send(command);
            if (!result)
                return BadRequest(GlobalResponse<string>.Error("Error deleting song"));
            
            return Ok(GlobalResponse<string>.Success(data: "Deleted successfully"));
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