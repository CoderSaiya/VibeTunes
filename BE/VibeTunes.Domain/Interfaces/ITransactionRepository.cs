using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Interfaces;

public interface ITransactionRepository
{
    public Task<IEnumerable<Transaction>> GetAllTransactionsAsync();
    public Task<Transaction?> GetTransactionsByIdAsync(Guid transactionId);
    public Task<IEnumerable<Transaction>> GetTransactionsByUserIdAsync(Guid userId);
    public Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(DateTime date);
    public Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(Guid userId, DateTime date);
    public Task<IEnumerable<Transaction>> GetTransactionsByStatusAsync(TransactionStatus status);
    public Task<IEnumerable<Transaction>> GetTransactionsByFilterAsync(TransactionFilter filter);
    public Task<bool> CreateTransactionAsync(Transaction transaction);
    public Task<bool> UpdateTransactionAsync(Transaction transaction);
    public Task<bool> DeleteTransactionAsync(Guid transactionId);
}