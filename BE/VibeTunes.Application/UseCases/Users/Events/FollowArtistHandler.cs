using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class FollowArtistHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<FollowArtistCommand, Unit>
{
    public async Task<Unit> Handle(FollowArtistCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId);
        if (user is null)
            throw new BusinessException("User not found");

        var artist = await userRepository.GetArtistByIdAsync(request.ArtistId);
        if (artist is null)
            throw new BusinessException("Artist not found");

        if (user.FollowedArtists.Any(a => a.Id == request.ArtistId))
        {
            user.FollowedArtists.Remove(artist);
            artist.Followers.Remove(user);
        }
        else
        {
            user.FollowedArtists.Add(artist);
            artist.Followers.Add(user);
        }

        await unitOfWork.CommitAsync();
        return Unit.Value;
    }
}