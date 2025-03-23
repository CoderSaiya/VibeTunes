using Microsoft.AspNetCore.Mvc;
using VibeTunes.Application.DTOs;
using VibeTunes.Infrastructure.Factories;

namespace VibeTunes.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController(PaymentGatewayFactory paymentGatewayFactory) : Controller
{
    [HttpPost("create-payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentReq request)
    {
        var paymentGateway = paymentGatewayFactory.GetPaymentGateway(request.PaymentMethod);
        var response = await paymentGateway.CreatePaymentIntentAsync(request);
        return Ok(response);
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
}