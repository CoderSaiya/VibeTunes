using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
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
        var orderId = Guid.NewGuid().ToString();
        var requestId = Guid.NewGuid().ToString();
        var amount = (long)(request.Amount);
        
        var rawHash = new StringBuilder()
            .Append($"accessKey={_momoConfig.AccessKey}")
            .Append($"&amount={amount}")
            .Append("&extraData=")
            .Append($"&ipnUrl={_momoConfig.NotifyUrl}")
            .Append($"&orderId={orderId}")
            .Append("&orderInfo=Thanh toán qua mã QR MoMo")
            .Append($"&partnerCode={_momoConfig.PartnerCode}")
            .Append($"&redirectUrl={_momoConfig.ReturnUrl}")
            .Append($"&requestId={requestId}")
            .Append("&requestType=captureWallet")
            .ToString();

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_momoConfig.SecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawHash));
        var signature = BitConverter.ToString(hashBytes)
            .Replace("-", string.Empty)
            .ToLowerInvariant();

        var payload = new
        {
            partnerCode = _momoConfig.PartnerCode,
            partnerName = "Test",
            storeId = "MomoTestStore",
            requestId,
            amount,
            orderId,
            orderInfo = "Thanh toán qua mã QR MoMo",
            redirectUrl = _momoConfig.ReturnUrl,
            ipnUrl = _momoConfig.NotifyUrl,
            lang = "vi",
            extraData = string.Empty,
            requestType = "captureWallet",
            signature
        };

        using var client = new HttpClient();
        var response = await client.PostAsJsonAsync(_momoConfig.Endpoint, payload);
        var momoResp = await response.Content.ReadFromJsonAsync<MomoResponse>();
        
        if (momoResp == null)
            throw new BusinessException("MoMo did not return any JSON.");

        if (momoResp.ResultCode != 0)
            throw new BusinessException($"MoMo Error #{momoResp.ResultCode}: {momoResp.Message}");
        
        var transaction = new Transaction
        {
            Id = Guid.Parse(orderId),
            UserId = request.UserId,
            SubscriptionId = Guid.Parse("fe2783f0-4073-4be1-ae6c-237beed44f7f"),
            Amount = amount,
            Currency = request.Currency,
            PaymentMethod = "MoMo",
            Status = TransactionStatus.Pending,
        };

        await transactionRepository.CreateTransactionAsync(transaction);
        await unitOfWork.CommitAsync();

        return new PaymentRes
        {
            PaymentUrl = momoResp.PayUrl,
            TransactionId = orderId,
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