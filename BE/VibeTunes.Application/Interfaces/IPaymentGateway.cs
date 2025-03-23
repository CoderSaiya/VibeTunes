using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.Interfaces;

public interface IPaymentGateway
{
    Task<PaymentRes> CreatePaymentIntentAsync(PaymentReq request);
    Task<bool> HandleWebhookAsync(string json, string signature);
}