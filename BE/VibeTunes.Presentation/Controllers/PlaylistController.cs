using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Playlists.Commands;
using VibeTunes.Application.UseCases.Playlists.Queries;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistController(IMediator mediator) : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetPlaylists([FromQuery] GetPlaylistsQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var playlists = await mediator.Send(query);
            Console.WriteLine(playlists);
            return Ok(GlobalResponse<IEnumerable<PlaylistDto>>.Success(data: playlists));
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
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlaylistById([FromRoute] Guid id)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var playlist = await mediator.Send(new GetPlaylistByIdQuery(id));
            Console.WriteLine(playlist);
            return Ok(GlobalResponse<PlaylistDto>.Success(data: playlist));
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
    
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPlaylistByUserId([FromRoute] Guid userId)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var playlists = await mediator.Send(new GetPlaylistByUserQuery(userId));
            Console.WriteLine(playlists);
            return Ok(GlobalResponse<IEnumerable<PlaylistDto>>.Success(data: playlists));
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
    
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreatePlaylist([FromForm] CreatePlaylistCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var playlistId = await mediator.Send(command);
            Console.WriteLine(playlistId);
            return Ok(GlobalResponse<string>.Success(data: $"Playlist {playlistId} has been created"));
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
    
    [HttpPatch("{playlistId}/songs")]
    public async Task<IActionResult> AddSongsToPlaylist(string playlistId, [FromBody] List<string> songIds)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var id = await mediator.Send(new AddSongsPlaylistCommand
            (
                PlaylistId: playlistId,
                SongIds: songIds
            ));
            Console.WriteLine(id);
            return Ok(GlobalResponse<string>.Success(data: $"Added {songIds.Count} songs to playlist {playlistId}"));
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

    [HttpPut]
    public async Task<IActionResult> UpdatePlaylist([FromForm] UpdatePlaylistCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var playlistId = await mediator.Send(command);
            Console.WriteLine(playlistId);
            return Ok(GlobalResponse<string>.Success(data: $"Playlist {playlistId} has been updated"));
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

    [HttpDelete]
    public async Task<IActionResult> DeletePlaylist([FromBody] DeletePlaylistCommand command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var result = await mediator.Send(command);
            if (!result)
                return BadRequest(new { error = "Playlist could not be deleted." });
            
            return Ok(GlobalResponse<string>.Success(data: $"Playlist has been deleted"));
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