using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Playlists.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class DeletePlaylistHandler(
    IPlaylistRepository playlistRepository,
    IFileService fileService,
    IUnitOfWork unitOfWork
    ): IRequestHandler<DeletePlaylistCommand, bool>
{
    public async Task<bool> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        var existingPlaylist = await playlistRepository.GetPlaylistByIdAsync(request.PlaylistId);
        if (existingPlaylist is null)
            throw new BusinessException($"Playlist with id {request.PlaylistId} does not exist");

        await fileService.DeleteFileAsync(existingPlaylist.CoverImgUrl, cancellationToken);
        
        var isDeleted = await playlistRepository.DeletePlaylistAsync(request.PlaylistId);
        
        return isDeleted;
    }
}