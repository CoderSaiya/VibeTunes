using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Subscriptions.Commands;

public sealed record CreateSubscriptionCommand(
    SubscriptionDto Subscription
    ) : IRequest<Guid>;