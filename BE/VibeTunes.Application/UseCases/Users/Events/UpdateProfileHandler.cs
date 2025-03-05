using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Users.Events;

public class UpdateProfileHandler(
    IUserRepository userRepository, 
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpdateProfileCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
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

        if (!string.IsNullOrWhiteSpace(request.Avatar))
            profile.Avatar = request.Avatar;
        
        await unitOfWork.CommitAsync();
        
        return Unit.Value;
    }
}