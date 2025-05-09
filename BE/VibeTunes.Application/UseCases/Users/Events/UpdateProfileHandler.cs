using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Users.Events;

public class UpdateProfileHandler(
    IUserRepository userRepository, 
    IFileService fileService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpdateProfileCommand, Guid>
{
    public async Task<Guid> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId);
        if (user is null) 
            throw new BusinessException("User does not exist");
        
        var profile = user.Profile;

        if (!string.IsNullOrWhiteSpace(request.FirstName) || !string.IsNullOrWhiteSpace(request.LastName))
            profile.Name = new Name(request.FirstName ?? profile.Name?.FirstName, 
                request.LastName ?? profile.Name?.LastName);

        if (!string.IsNullOrWhiteSpace(request.Address))
            profile.Address = Address.Parse(request.Address);

        if (!string.IsNullOrWhiteSpace(request.Gender) && Enum.TryParse<Gender>(request.Gender, true, out var gender))
            profile.Gender = gender;

        if (request.Avatar is not null)
        {
            var avatar = profile.Avatar;
            
            var isHttpUrl = avatar.StartsWith("http");
            if (!isHttpUrl) await fileService.DeleteFileAsync(avatar, cancellationToken);
            
            var key = $"avatars/{user.Id}/{Guid.NewGuid()}_{request.Avatar.FileName}";
            await using (var stream = request.Avatar.OpenReadStream())
            {
                await fileService.UploadFileAsync(stream, key, cancellationToken);
            }
            
            profile.Avatar = key;
        }
        
        await unitOfWork.CommitAsync();
        
        return profile.UserId;
    }
}