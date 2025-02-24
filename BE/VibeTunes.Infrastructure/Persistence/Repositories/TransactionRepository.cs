using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class TransactionRepository(AppDbContext context) : ITransactionRepository
{
    public async Task<IEnumerable<Transaction>> GetAllTransactionsAsync()
    {
        return await context.Transactions.ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByUserIdAsync(Guid userId)
    {
        return await context.Transactions
            .Where(t => t.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(DateTime date)
    {
        return await context.Transactions
            .Where(t => t.CreatedDate == date)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByDateAsync(Guid userId, DateTime date)
    {
        return await context.Transactions
            .Where(t => t.CreatedDate == date && t.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByStatusAsync(TransactionStatus status)
    {
        return await context.Transactions
            .Where(t => (int)t.Status == (int)status)
            .ToListAsync();
    }

    public async Task<bool> CreateTransactionAsync(Transaction transaction)
    {
        try
        {
            await context.Transactions.AddAsync(transaction);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateTransactionAsync(Transaction transaction)
    {
        var existingTransaction = await context.Transactions.FindAsync(transaction.Id);
        if (existingTransaction == null)
            return false;
        
        context.Entry(existingTransaction).CurrentValues.SetValues(transaction);
        return true;
    }

    public async Task<bool> DeleteTransactionAsync(Guid transactionId)
    {
        var existingTransaction = await context.Transactions.FindAsync(transactionId);
        if (existingTransaction == null)
            return false;
        
        context.Transactions.Remove(existingTransaction);
        return true;
    }
}