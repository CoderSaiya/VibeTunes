using System.Security.Claims;
using Google.Apis.Auth;
using MediatR;
using Microsoft.Extensions.Configuration;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class GoogleLoginHandler(
    IAuthService authService,
    IUserRepository userRepository,
    IProfileRepository profileRepository,
    IGmailService gmailService,
    IUnitOfWork unitOfWork,
    IConfiguration configuration
) : IRequestHandler<GoogleLoginCommand, TokenDto>
{
    public async Task<TokenDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings()
        {
            Audience = new[] { configuration["GoogleAuth:ClientId"]! }
        };
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        
        var userId= payload.Subject;  // Google unique ID
        var email = payload.Email;
        var fullName = payload.Name;
        
        var user = await userRepository.GetByEmailAsync(email);
        
        if (user is null)
        {
            var nameParts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.FirstOrDefault() ?? "";
            var lastName = nameParts.Length > 1 
                ? string.Join(" ", nameParts.Skip(1)) 
                : "";

            user = new User(email, "GoogleLogin", new Email(email))
            {
                IsActive   = true,
                ActiveCode = ""
            };
            await userRepository.AddAsync(user);
            
            var newProfile = new Profile
            {
                Name = new Name(firstName, lastName),
                UserId = user.Id,    
            };

            await profileRepository.CreateProfileAsync(newProfile);
            
            await unitOfWork.CommitAsync();
            
            var htmlBody = $@"
                <div style=""font-family: Arial, sans-serif; line-height:1.6; color: #333;"">
                  <h2 style=""color: #4A90E2;"">Welcome to VibeTunes, {firstName}!</h2>
                  <p>We're thrilled to have you on board.</p>
                  <p><strong>Your account:</strong> {email}</p>
                  <hr style=""border:none; height:1px; background:#eee;"" />
                  <p>If you have any questions, just reply to this email—we're here to help.</p>
                  <p>Enjoy exploring!</p>
                  <p style=""margin-top:30px; color:#999;"">— The VibeTunes Team</p>
                </div>";
            
            await gmailService.SendEmailAsync(email, "Welcome to VibeTunes 🎉", htmlBody);
        }
        
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.EmailAddress.Value),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user is Admin ? "Admin" : user is Artist ? "Artist" : "User"),
        };

        var accessToken = authService.GenerateAccessToken(claims);
        var refreshToken = authService.GenerateRefreshToken();

        var token = new TokenDto(accessToken, refreshToken);

        return token;
    }
}