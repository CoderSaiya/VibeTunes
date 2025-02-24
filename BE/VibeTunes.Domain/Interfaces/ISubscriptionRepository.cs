using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface ISubscriptionRepository
{
    public Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync();
    public Task<bool> CreateSubscriptionAsync(Subscription subscription);
    public Task<bool> UpdateSubscriptionAsync(Subscription subscription);
    public Task<bool> DeleteSubscriptionAsync(Guid subscriptionId);
}