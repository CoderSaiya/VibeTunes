using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Albums.Queries;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetArtistProfileHandler(
    IUserRepository userRepository,
    IFileService fileService,
    IMediator mediator
    ) : IRequestHandler<GetArtistProfileQuery, ArtistDto>
{
    public async Task<ArtistDto> Handle(GetArtistProfileQuery request, CancellationToken cancellationToken)
    {
        var existingArtist = await userRepository.GetArtistByIdAsync(request.ArtistId);
        if (existingArtist is null)
            throw new BusinessException("Artist not found!");
        
        var avatar = existingArtist.Profile.Avatar;
        var isUrl = avatar!.StartsWith("http");
        if (!isUrl) avatar = await fileService.GetUrlAsync(avatar, cancellationToken); 
        
        var songTasks = existingArtist.Songs
            .OrderByDescending(s => s.Streams)
            .Take(5)
            .Select(async s =>
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
                s.Duration.ToString(@"mm\:ss"), 
                audioUrl,
                imageUrl,
                s.Streams, 
                s.Status.ToString(),
                s.Album?.Title ?? string.Empty,
                s.ReleaseDate.ToString("dd/MM/yyyy")
            );
        });
        var popularSongs = (await Task.WhenAll(songTasks)).ToList();

        var albumsTasks = existingArtist.Albums
            .Select(async a => await mediator.Send(new GetAlbumByIdQuery(a.Id), cancellationToken));
        var albums = (await Task.WhenAll(albumsTasks)).ToList();

        return new ArtistDto(
            Id: existingArtist.Id,
            StageName:existingArtist.StageName,
            avatar,
            Followers: existingArtist.Followers.Count,
            Bio: existingArtist.Bio,
            PopularSongs: popularSongs,
            Albums: albums
        );
    }
}