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
    IGmailService mailService,
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
        
        //send email
        var verificationLink = $"http://localhost:3000/verify-account?code={user.ActiveCode}";
    
        var emailBody = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; }}
                .header {{ color: #2c3e50; text-align: center; }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; text-align: center; color: #7f8c8d; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <h1 class='header'>🎵 Welcome to VibeTunes! 🎶</h1>
                
                <p>Hi {user.Username},</p>
                
                <p>Thank you for creating a VibeTunes account. To start using your account, 
                please verify your email address:</p>
                
                <p style='text-align: center'>
                    <a href='{verificationLink}' class='button'>
                        Verify Your Email
                    </a>
                </p>

                <p>Or copy and paste this link into your browser:<br>
                <code>{verificationLink}</code></p>

                <div class='footer'>
                    <p>Need help? Contact our support team at 
                    <a href='mailto:support@vibetunes.com'>support@vibetunes.com</a></p>
                    <p>© 2025 VibeTunes. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
        
        await mailService.SendEmailAsync(
            user.EmailAddress.Value,
            "🎧 Please verify your VibeTunes account",
            emailBody
        );
        
        await unitOfWork.CommitAsync();

        return user.Id;
    }
}