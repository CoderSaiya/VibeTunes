using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetUsersHandler(
    IUserRepository userRepository,
    IFileService fileService
    ) : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    public async Task<IEnumerable<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var filter = request.Filter ?? new UserFilter();
        var users = await userRepository.GetUsersByFilterAsync(filter, request.IsArtist);

        var result = new List<UserDto>();
        foreach (var u in users)
        {
            string? avatar = null;
            var rawAvatar = u.Profile?.Avatar;
            if (!string.IsNullOrWhiteSpace(rawAvatar))
            {
                if (rawAvatar.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                {
                    avatar = rawAvatar;
                }
                else
                {
                    avatar = await fileService.GetUrlAsync(rawAvatar, cancellationToken);
                }
            }

            result.Add(new UserDto(
                Username: u.Username,
                Password: u.Password,
                StageName: u is Artist artist1 ? artist1.StageName : null,
                Bio: u is Artist artist2 ? artist2.Bio : null,
                FirstName: u?.Profile?.Name?.FirstName,
                LastName: u?.Profile?.Name?.LastName,
                Rank: u.Rank.ToString(),
                IsActive: u.IsActive,
                IsBanned: u.IsBanned,
                Address: u?.Profile?.Address,
                Gender: u?.Profile?.Gender?.ToString(),
                Avatar: avatar,
                Role: request.IsArtist
                    ? "Artist"
                    : u switch
                    {
                        Artist _ => "Artist",
                        Admin _ => "Admin",
                        _ => "User"
                    },
                u.Id.ToString(),
                u.CreatedDate.ToString("dd/MM/yyyy")
            ));
        }
        return result;
    }
}