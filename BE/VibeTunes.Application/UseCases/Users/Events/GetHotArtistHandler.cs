using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetHotArtistHandler(
    IUserRepository userRepository,
    IFileService fileService
    ) : IRequestHandler<GetHotArtistQuery, IEnumerable<HotArtistDto>>
{
    public async Task<IEnumerable<HotArtistDto>> Handle(GetHotArtistQuery request, CancellationToken cancellationToken)
    {
        var size = request.Size ?? 5;
        var artists = await userRepository.GetHotArtistAsync(size);
        
        var result = new List<HotArtistDto>();
        foreach (var a in artists)
        {
            var topGenres = await userRepository.GetTopGenresAsync(a.Id);

            var topGenreName = topGenres.FirstOrDefault()?.GenreName
                               ?? string.Empty;

            var totalStreams = a.Songs?.Sum(s => s.Streams) ?? 0;
            
            
            var avatar = a.Profile.Avatar;
            var isUrl = avatar!.StartsWith("http");
            if (!isUrl) avatar = await fileService.GetUrlAsync(avatar, cancellationToken); 

            result.Add(new HotArtistDto(
                a.Id,
                avatar,
                a.StageName,
                topGenreName,
                a.Followers.Count,
                totalStreams,
                a.Albums.Count,
                a.Songs.Count
            ));
        }

        return result;
    }
}