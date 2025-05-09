using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Transactions.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Transactions.Events;

public class GetTransactionStatusHandler(
    ITransactionRepository transactionRepository
) : IRequestHandler<GetTransactionStatusQuery, string>
{
    public async Task<string> Handle(GetTransactionStatusQuery request, CancellationToken cancellationToken)
    {
        var existingTransaction = await transactionRepository.GetTransactionsByIdAsync(request.TransactionId);
        if (existingTransaction is null) 
            throw new BusinessException("Transaction not found.");
        
        return existingTransaction.Status.ToString();
    }
}