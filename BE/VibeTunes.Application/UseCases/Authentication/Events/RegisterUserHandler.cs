using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class RegisterUserHandler(
    IUserRepository userRepository,
    IAuthService authService,
    IProfileRepository profileRepository,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<RegisterUserCommand, Guid>
{
    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // check email
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new BusinessException("User with this email already exists.");
        
        // hash password
        var passwordHash = authService.HashPassword(request.Password);
        
        // create account
        var email = new Email(request.Email);
        User user = new User(request.Email, passwordHash, email);
        await userRepository.AddAsync(user);

        Name name = new(request.FirstName, request.LastName);
        Profile profile = new Profile
        {
            Name = name,
            UserId = user.Id,
        };
        await profileRepository.CreateProfileAsync(profile);
        
        await unitOfWork.CommitAsync();

        return user.Id;
    }
}