using MediatR;

namespace VibeTunes.Application.UseCases.Transactions.Queries;

public sealed record GetTransactionStatusQuery(Guid TransactionId) : IRequest<string>;