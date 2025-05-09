using MediatR;
using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Transactions.Queries;
using VibeTunes.Infrastructure.Factories;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController(
    PaymentGatewayFactory paymentGatewayFactory,
    IMediator mediator
    ) : Controller
{
    [HttpPost("create-payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentReq request)
    {
        try
        {
            var paymentGateway = paymentGatewayFactory.GetPaymentGateway(request.PaymentMethod);
            var response = await paymentGateway.CreatePaymentIntentAsync(request);
            return Ok(GlobalResponse<PaymentRes>.Success(response));
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

    [HttpPost("webhook/{provider}")]
    public async Task<IActionResult> HandleWebhook(string provider)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"];

        var paymentGateway = paymentGatewayFactory.GetPaymentGateway(provider);
        var success = await paymentGateway.HandleWebhookAsync(json, signature);

        return success ? Ok() : BadRequest();
    }

    [HttpGet("transaction/{transactionId}/status")]
    public async Task<IActionResult> GetTransactionStatus([FromRoute] Guid transactionId)
    {
        var status = await mediator.Send(new GetTransactionStatusQuery(transactionId));
        Console.WriteLine(status);
        return Ok(GlobalResponse<string>.Success(status));
    }
}