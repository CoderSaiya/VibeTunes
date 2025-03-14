using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository(AppDbContext context) : ISubscriptionRepository
{
    public async Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync()
    {
        return await context.Subscriptions.ToListAsync();
    }

    public async Task<IEnumerable<Subscription>> GetSubscriptionsByFilterAsync(SubscriptionFilter filter)
    {
        IQueryable<Subscription> query = context.Subscriptions
            .AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
            query = query.Where(s => s.Name.ToLower().Contains(filter.Keyword.ToLower()));
        
        if (filter.MinPrice.HasValue)
            query = query.Where(s => s.Price >= filter.MinPrice);
        if (filter.MaxPrice.HasValue)
            query = query.Where(s => s.Price <= filter.MaxPrice);
        
        if (filter.MinDuration.HasValue)
            query = query.Where(s => s.Duration >= filter.MinDuration);
        if (filter.MaxDuration.HasValue)
            query = query.Where(s => s.Duration <= filter.MaxDuration);
        
        if (filter.Tags is not null && filter.Tags.Length > 0)
            query = query.Where(s => s.Tags.Any(t => filter.Tags.Contains(t)));
        
        if (filter.Benefits is not null && filter.Benefits.Length > 0)
            query = query.Where(s => s.Benefits.Any(t => filter.Benefits.Contains(t)));
        
        string orderByString = $"{filter.SortBy} {filter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);
        
        return await query.ToListAsync();
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