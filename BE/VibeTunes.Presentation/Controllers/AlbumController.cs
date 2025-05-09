using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Albums.Commands;
using VibeTunes.Application.UseCases.Albums.Queries;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumController(IMediator mediator) : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetAlbumsList([FromQuery] GetAlbumsQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var albums = await mediator.Send(query);
            Console.WriteLine(albums);
            return Ok(GlobalResponse<IEnumerable<AlbumDto>>.Success(data: albums));
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
    public async Task<IActionResult> GetAlbumsListByArtist([FromQuery] GetAlbumsByArtistQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var albums = await mediator.Send(query);
            Console.WriteLine(albums);
            return Ok(GlobalResponse<IEnumerable<AlbumDto>>.Success(data: albums));
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

    [HttpPost]
    public async Task<IActionResult> CreateAlbum([FromForm] CreateAlbumCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var albumId = await mediator.Send(command);
            Console.WriteLine(albumId);
            return Ok(GlobalResponse<string>.Success(data: $"Album created successfully with ID #{albumId.ToString()}"));
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

    [HttpPut]
    public async Task<IActionResult> UpdateAlbum([FromForm] UpdateAlbumCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var albumId = await mediator.Send(command);
            Console.WriteLine(albumId);
            return Ok(GlobalResponse<string>.Success(data: $"Album with ID #{albumId.ToString()} updated successfully"));
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
    public async Task<IActionResult> DeleteAlbum([FromBody] DeleteAlbumCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var isDelete = await mediator.Send(command);
            Console.WriteLine(isDelete);
            return Ok(GlobalResponse<string>.Success(data: "Album delete successfully"));
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