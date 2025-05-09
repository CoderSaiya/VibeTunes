using Microsoft.Extensions.Options;
using Stripe;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Infrastructure.Services;

public class StripeGateway(
    IOptions<StripeOptions> stripeOptions, 
    ITransactionRepository transactionRepository,
    IUnitOfWork unitOfWork
    ) : IPaymentGateway
{
    private readonly string _secretKey = stripeOptions.Value.SecretKey;
    private readonly string _webhookSecret = stripeOptions.Value.WebhookSecret;
    
    public async Task<PaymentRes> CreatePaymentIntentAsync(PaymentReq request)
    {
        var transactionId = Guid.NewGuid();
        StripeConfiguration.ApiKey = _secretKey;
        
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(request.Amount * 100), 
            Currency = request.Currency.ToLower(),
            PaymentMethodTypes = new List<string> { "card" },
            Metadata = new Dictionary<string, string>
            {
                { "UserId", request.UserId.ToString() },
                { "TransactionId", transactionId.ToString() }
            }
        };
        
        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);
        
        var transaction = new Transaction
        {
            Id = transactionId,
            UserId = request.UserId,
            SubscriptionId = Guid.Parse("fe2783f0-4073-4be1-ae6c-237beed44f7f"),
            Amount = (long)(request.Amount * 100),
            Currency = request.Currency.ToLower(),
            PaymentMethod = request.PaymentMethod.ToLower(),
        };
        
        await transactionRepository.CreateTransactionAsync(transaction);
        
        await unitOfWork.CommitAsync();
        
        return new PaymentRes { ClientSecret = paymentIntent.ClientSecret };
    }

    public async Task<bool> HandleWebhookAsync(string json, string signature)
    {
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, signature, _webhookSecret);
            
            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                if (stripeEvent.Data.Object is PaymentIntent paymentIntent &&
                    paymentIntent.Metadata.TryGetValue("TransactionId", out var transactionIds) &&
                    Guid.TryParse(transactionIds, out var transactionId))
                {
                    var transaction = await transactionRepository.GetTransactionsByIdAsync(transactionId);
                    if (transaction is not null)
                    {
                        transaction.Status = TransactionStatus.Success;
                        transaction.ModifiedDate = DateTime.UtcNow;
                        await unitOfWork.CommitAsync();
                    }
                }
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Stripe Webhook Error: {ex.Message}");
            return false;
        }
    }
}