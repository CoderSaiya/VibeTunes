using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Playlists.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Playlists.Events;

public class CreatePlaylistHandler(
    IPlaylistRepository playlistRepository,
    IUserRepository userRepository,
    INotificationService notificationService,
    IFileService fileService,
    IMediator mediator,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<CreatePlaylistCommand, Guid>
{
    public async Task<Guid> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var userIdg = Guid.Parse(request.UserId);
        var playlist = new Playlist
        {
            UserId = userIdg,
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic
        };
        
        var playlistKey = $"playlists/{playlist.Id}/{Guid.NewGuid()}_{request.Image.FileName}";
        await using (var playlistStream = request.Image.OpenReadStream())
        {
            await fileService.UploadFileAsync(playlistStream, playlistKey, cancellationToken);
        }
        playlist.CoverImgUrl = playlistKey;
        
        var created = await playlistRepository.CreatePlaylistAsync(playlist);
        if (!created)
        {
            throw new BusinessException("There was an error while creating the playlist.");
        }
        await unitOfWork.CommitAsync();

        if (request.SongIds != null && request.SongIds.Any())
        {
            var command = new AddSongsPlaylistCommand(playlist.Id.ToString(), request.SongIds);
            await mediator.Send(command, cancellationToken);
        }

        if (!request.IsPublic)
        {
            var admin = await userRepository.GetByEmailAsync("admin@gmail.com");
            if (admin != null)
                await notificationService.SendNotification(admin.Id, userIdg, "Your playlist has been created!");
        }

        await unitOfWork.CommitAsync();
        
        return playlist.Id;
    }
}