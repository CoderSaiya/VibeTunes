using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Subscriptions.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Subscriptions.Events;

public class GetSubscriptionsHandler(
    ISubscriptionRepository subscriptionRepository
    ) : IRequestHandler<GetSubscriptionsQuery, IEnumerable<SubscriptionDto>>
{
    public async Task<IEnumerable<SubscriptionDto>> Handle(GetSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new SubscriptionFilter();
        var result = await subscriptionRepository.GetSubscriptionsByFilterAsync(filter);
        return result.Select(s => new SubscriptionDto(s.Name, s.Price, s.Duration, s.Tags, s.Benefits));
    }
}