using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Application.UseCases.Users.Events;

public class UpgradeArtistHandler(
    IUserRepository userRepository,
    INotificationService notificationService,
    IGmailService mailService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<UpgradeArtistCommand, Guid>
{
    public async Task<Guid> Handle(UpgradeArtistCommand request, CancellationToken cancellationToken)
    {
        // check user exist
        var existingUser = await userRepository.GetByIdAsync(request.UserId);
        if (existingUser is null)
            throw new BusinessException("User does not exist");
        
        // check user active
        if (!existingUser.IsActive)
            throw new BusinessException("User does not active");
        
        // check user status
        if (existingUser.IsBanned)
            throw new BusinessException("User already banned");
        
        // check type user
        if (existingUser is Artist)
            throw new BusinessException("User is already artist");
        
        // upgrade user
        var artist = new Artist(
            existingUser.Username,
            existingUser.Password,
            new Email(existingUser.EmailAddress.Value),
            request.StageName,
            request.Bio
        )
        {
            Id = existingUser.Id,
            CreatedDate = existingUser.CreatedDate,
            IsActive = existingUser.IsActive,
            IsBanned = existingUser.IsBanned,
            Rank = existingUser.Rank,
            Profile = existingUser.Profile,
            RefreshTokens = existingUser.RefreshTokens,
            Histories = existingUser.Histories,
            Transactions = existingUser.Transactions,
            NotificationsSent = existingUser.NotificationsSent,
            NotificationsReceived = existingUser.NotificationsReceived,
            Playlists = existingUser.Playlists
        };
        
        await userRepository.ReplaceUserAsync(existingUser, artist);
        
        // send email && notification
        await notificationService.SendNotification(Guid.Parse("c7b70dd9-29c7-45ce-91de-220c9795758a"), artist.Id, "User upgraded");
        
        var upgradeNotificationLink = $"http://localhost:3000/dashboard";

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
                    background-color: #2ecc71;
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
                <h1 class='header'>🎤 Congratulations, {artist.Username}! 🎉</h1>
                
                <p>We're excited to inform you that your VibeTunes account has been successfully upgraded to an <b>Artist</b> account! 🏆</p>

                <p>You now have access to exclusive artist features, including:</p>
                <ul>
                    <li>🎵 Upload and manage your songs & albums</li>
                    <li>📈 View detailed analytics on your audience</li>
                    <li>🎭 Customize your artist profile</li>
                    <li>📢 Engage with your fans through notifications</li>
                </ul>

                <p style='text-align: center'>
                    <a href='{upgradeNotificationLink}' class='button'>
                        Go to Your Artist Dashboard
                    </a>
                </p>

                <p>Or copy and paste this link into your browser:<br>
                <code>{upgradeNotificationLink}</code></p>

                <div class='footer'>
                    <p>Need help? Contact our support team at 
                    <a href='mailto:support@vibetunes.com'>support@vibetunes.com</a></p>
                    <p>© 2025 VibeTunes. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";

        await mailService.SendEmailAsync(
            artist.EmailAddress.Value,
            "🎶 Welcome to VibeTunes Artist Program!",
            emailBody
        );
        
        // commit
        await unitOfWork.CommitAsync();
        
        return existingUser.Id;
    }
}