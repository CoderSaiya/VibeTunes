using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetProfileHandler(
    IProfileRepository profileRepository,
    IUserRepository userRepository,
    IHistoryRepository historyRepository,
    IFileService fileService
    ) : IRequestHandler<GetProfileQuery, ProfileDto>
{
    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        // check profile exist
        var profile = await profileRepository.GetProfileByUserAsync(request.UserId);
        if (profile is null)
            throw new BusinessException("User does not exist");
        
        var user = await userRepository.GetByIdAsync(profile.UserId);
        
        var stageName = (user as Artist)?.StageName ?? null;
        var bio = (user as Artist)?.Bio ?? null;

        var filter = new HistoryFilter
        {
            UserId = user!.Id,
        };
        var latestSong = await historyRepository.GetHistoriesByFilter(filter);
        var songDtoList = (await Task.WhenAll(latestSong.Select(async s =>
        {
            var imageUrl = await fileService.GetUrlAsync(s.CoverImgUrl, cancellationToken);
            var audioUrl = await fileService.GetUrlAsync(s.FileUrl, cancellationToken);
            var genreString = s.Genres.Any()
                ? string.Join(", ", s.Genres.Select(g => g.GenreName))
                : string.Empty;

            return new SongDto(
                s.Id,
                s.Title,
                s.Artist.StageName,
                genreString,
                s.Duration.ToString(@"hh\:mm"),
                audioUrl,
                imageUrl,
                s.Streams,
                s.Status.ToString(),
                s.CreatedDate.ToString("dd/MM/yyyy")
            );
        }))).ToList();
        
        var topGenres = await historyRepository.GetTopGenresByUserAsync(user.Id);
        var topGenreNames = topGenres.Select(x => x.GenreName).ToList();
        
        string? avatar = null;
        var rawAvatar = user.Profile?.Avatar;
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

        // return data
        return new ProfileDto(
            profile.Name!,
            stageName,
            bio,
            profile.Address,
            profile.Gender,
            avatar,
            profile.User is Artist artist 
                ? artist.Followers.Count 
                : null,
            profile.User.FollowedArtists.Count,
            songDtoList,
            topGenreNames);
    }
}