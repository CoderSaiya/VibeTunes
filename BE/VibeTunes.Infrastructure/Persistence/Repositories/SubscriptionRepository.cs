using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository(AppDbContext context) : ISubscriptionRepository
{
    public async Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync()
    {
        return await context.Subscriptions.ToListAsync();
    }

    public async Task<bool> CreateSubscriptionAsync(Subscription subscription)
    {
        try
        {
            await context.Subscriptions.AddAsync(subscription);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateSubscriptionAsync(Subscription subscription)
    {
        var existingSubscription = await context.Subscriptions.FindAsync(subscription.Id);
        if (existingSubscription == null)
            return false;
        
        context.Entry(existingSubscription).CurrentValues.SetValues(existingSubscription);
        return true;
    }

    public async Task<bool> DeleteSubscriptionAsync(Guid subscriptionId)
    {
        var existingSubscription = await context.Subscriptions.FindAsync(subscriptionId);
        if (existingSubscription == null)
            return false;
        
        context.Subscriptions.Remove(existingSubscription);
        return true;
    }
}