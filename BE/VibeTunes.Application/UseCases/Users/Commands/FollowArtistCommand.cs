using MediatR;

namespace VibeTunes.Application.UseCases.Users.Commands;

public sealed record FollowArtistCommand(Guid UserId, Guid ArtistId) : IRequest<Unit>;