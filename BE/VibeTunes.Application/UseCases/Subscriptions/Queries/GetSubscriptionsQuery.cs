using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Subscriptions.Queries;

public record GetSubscriptionsQuery(SubscriptionFilter? Filter) : IRequest<IEnumerable<SubscriptionDto>>;