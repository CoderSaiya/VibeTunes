using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Subscriptions.Queries;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionController(IMediator mediator) : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetSubscriptions([FromQuery] GetSubscriptionsQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var subscriptionDto = await mediator.Send(query);
            Console.WriteLine(subscriptionDto);
            return Ok(GlobalResponse<IEnumerable<SubscriptionDto>>.Success(
                data: subscriptionDto,
                message: "Subscriptions retrieved successfully"));
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