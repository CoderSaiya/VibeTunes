using MediatR;
using VibeTunes.Application.UseCases.Subscriptions.Commands;

namespace VibeTunes.Application.UseCases.Subscriptions.Events;

public class CreateSubscriptionHandler() : IRequestHandler<CreateSubscriptionCommand, Guid>
{
    public async Task<Guid> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}