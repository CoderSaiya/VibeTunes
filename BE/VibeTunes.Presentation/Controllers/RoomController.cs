using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Infrastructure.Hubs;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomController : Controller
{
    [HttpGet]
    public IActionResult GetRooms()
    {
        var rooms = MusicHub.GetAllRooms();
        return Ok(GlobalResponse<IEnumerable<RoomInfoDto>>.Success(rooms));
    }
}