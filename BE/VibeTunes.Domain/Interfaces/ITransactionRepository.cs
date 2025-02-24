using VibeTunes.Domain.Entities;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Interfaces;

public interface ITransactionRepository
{
    public Task<IEnumerable<Transaction>> GetAllTransactionsAsync();
    public Task<IEnumerable<Transaction>> GetTransactionsByUserIdAsync(Guid userId);
    public Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(DateTime date);
    public Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(Guid userId, DateTime date);
    public Task<IEnumerable<Transaction>> GetTransactionsByStatusAsync(TransactionStatus status);
    public Task<bool> CreateTransactionAsync(Transaction transaction);
    public Task<bool> UpdateTransactionAsync(Transaction transaction);
    public Task<bool> DeleteTransactionAsync(Guid transactionId);
}