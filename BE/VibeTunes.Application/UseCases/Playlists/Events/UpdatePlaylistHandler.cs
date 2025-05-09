using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Playlists.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class UpdatePlaylistHandler(
    IPlaylistRepository playlistRepository,
    ISongRepository songRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpdatePlaylistCommand, Guid>
{
    public async Task<Guid> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var id = request.PlaylistId;
        
        var existingPlaylist = await playlistRepository.GetPlaylistByIdAsync(id);
        if (existingPlaylist is null) 
            throw new BusinessException($"Playlist with id {id} not found");
        
        existingPlaylist.Name = request.Name ?? existingPlaylist.Name;
        existingPlaylist.Description = request.Description ?? existingPlaylist.Description;
        existingPlaylist.IsPublic = request.IsPublic ?? existingPlaylist.IsPublic;

        var imgUrl = existingPlaylist.CoverImgUrl;
        if (request.Image is not null)
        {
            await fileService.DeleteFileAsync(imgUrl, cancellationToken);
            
            imgUrl = $"playlists/{existingPlaylist.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
            await using (var playlistStream = request.Image.OpenReadStream())
            {
                await fileService.UploadFileAsync(playlistStream, imgUrl, cancellationToken);
            }
        }
        existingPlaylist.CoverImgUrl = imgUrl;
        
        if (request.SongIds != null)
        {
            existingPlaylist.Songs.Clear();
            var songs = await songRepository.GetSongsByIdsAsync(request.SongIds);
            foreach (var song in songs)
            {
                existingPlaylist.Songs.Add(song);
            }
        }

        await unitOfWork.CommitAsync();

        return id;
    }
}