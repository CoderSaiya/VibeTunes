using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Domain.Interfaces;

public interface ISubscriptionRepository
{
    public Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync();
    public Task<IEnumerable<Subscription>> GetSubscriptionsByFilterAsync(SubscriptionFilter filter);
    public Task<bool> CreateSubscriptionAsync(Subscription subscription);
    public Task<bool> UpdateSubscriptionAsync(Subscription subscription);
    public Task<bool> DeleteSubscriptionAsync(Guid subscriptionId);
}