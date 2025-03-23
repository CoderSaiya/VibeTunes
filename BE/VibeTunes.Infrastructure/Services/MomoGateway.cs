using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Infrastructure.Services;

public class MomoGateway(
    IOptions<MoMoOptions> momoOptions,
    ITransactionRepository transactionRepository,
    IUnitOfWork unitOfWork
    ) : IPaymentGateway
{
    private readonly MoMoOptions _momoConfig = momoOptions.Value;
    
    public async Task<PaymentRes> CreatePaymentIntentAsync(PaymentReq request)
    {
        var transactionId = Guid.NewGuid();
        var rawHash = $"accessKey={_momoConfig.AccessKey}&" +
                      $"amount={request.Amount * 100}&" +
                      $"extraData=&ipnUrl={_momoConfig.NotifyUrl}&" +
                      $"orderId={transactionId}&" +
                      $"orderInfo=Thanh toán MoMo&" +
                      $"partnerCode={_momoConfig.PartnerCode}&" +
                      $"redirectUrl={_momoConfig.ReturnUrl}&" +
                      $"requestId={Guid.NewGuid()}&" +
                      $"requestType=captureWallet";

        var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_momoConfig.SecretKey));
        var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawHash)));

        var payload = new
        {
            partnerCode = _momoConfig.PartnerCode,
            requestId = Guid.NewGuid().ToString(),
            amount = request.Amount * 100,
            transactionId,
            orderInfo = "MoMo Payment",
            redirectUrl = _momoConfig.ReturnUrl,
            ipnUrl = _momoConfig.NotifyUrl,
            requestType = "captureWallet",
            extraData = "",
            signature
        };

        using var client = new HttpClient();
        var response = await client.PostAsJsonAsync(_momoConfig.Endpoint, payload);
        var jsonResponse = await response.Content.ReadFromJsonAsync<MomoResponse>();

        if (jsonResponse == null || jsonResponse.ResultCode != 0)
            throw new Exception("Failed to create MoMo Payment");
        
        var transaction = new Transaction
        {
            Id = transactionId,
            UserId = request.UserId,
            Amount = (long)(request.Amount * 100),
            Currency = request.Currency,
            PaymentMethod = "MoMo",
            Status = TransactionStatus.Pending,
        };

        await transactionRepository.CreateTransactionAsync(transaction);
        
        await unitOfWork.CommitAsync();

        return new PaymentRes
        {
            PaymentUrl = jsonResponse.PayUrl
        };
    }

    public async Task<bool> HandleWebhookAsync(string json, string signature)
    {
        var payload = JsonSerializer.Deserialize<MomoWebhookPayload>(json);
        if (payload == null || payload.ResultCode != 0) return false;

        var transaction = await transactionRepository.GetTransactionsByIdAsync(Guid.Parse(payload.OrderId));
        if (transaction != null)
        {
            transaction.Status = TransactionStatus.Success;
            await unitOfWork.CommitAsync();
        }

        return true;
    }
}