using VibeTunes.Domain.Specifications;

namespace VibeTunes.Domain.Interfaces;

public interface IPaymentGateway
{
    Task<PaymentRes> CreatePaymentIntentAsync(PaymentReq request);
    Task<bool> HandleWebhookAsync(string json, string signature);
}