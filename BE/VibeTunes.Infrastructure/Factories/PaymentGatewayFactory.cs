using Microsoft.Extensions.DependencyInjection;
using VibeTunes.Application.Interfaces;
using VibeTunes.Infrastructure.Services;

namespace VibeTunes.Infrastructure.Factories;

public class PaymentGatewayFactory(IServiceProvider serviceProvider)
{
    public IPaymentGateway GetPaymentGateway(string provider)
    {
        return provider.ToLower() switch
        {
            "stripe" => serviceProvider.GetRequiredService<StripeGateway>(),
            "momo" => serviceProvider.GetRequiredService<MomoGateway>(),
            _ => throw new NotImplementedException($"Payment provider {provider} is not supported")
        };
    }
}