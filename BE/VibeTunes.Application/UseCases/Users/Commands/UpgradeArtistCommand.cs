using MediatR;

namespace VibeTunes.Application.UseCases.Users.Commands;

public record UpgradeArtistCommand(
    Guid UserId,
    string StageName,
    string Bio
    ) : IRequest<Guid>;