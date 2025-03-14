using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetUsersEvent(
    IUserRepository userRepository
    ) : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    public async Task<IEnumerable<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new UserFilter();
        var users = await userRepository.GetUsersByFilterAsync(filter);
        return users.Select(u => new UserDto(
            u.Username, 
            u.Password,
            u.Profile.Name!.FirstName, 
            u.Profile.Name.LastName, 
            u.Rank.ToString(), 
            u.IsActive, 
            u.IsBanned, 
            u.Profile.Address!,
            u.Profile.Gender.ToString() ?? null, 
            u.Profile.Avatar!)
        );
    }
}