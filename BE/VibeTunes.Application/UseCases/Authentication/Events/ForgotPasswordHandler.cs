using System.Security.Cryptography;
using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class ForgotPasswordHandler(
    IUserRepository userRepository,
    IGmailService gmailService,
    IUnitOfWork unitOfWork
) : IRequestHandler<ForgotPasswordCommand, Task>
{
    public async Task<Task> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser is null)
            throw new BusinessException("User does not exist");
        
        if(!existingUser.IsActive)
            throw new BusinessException("User is not active");
        
        var code = RandomNumberGenerator
            .GetInt32(100000, 1000000)
            .ToString();
        
        existingUser.ActiveCode = code;
        
        var emailBody = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; }}
                .footer {{ margin-top: 30px; text-align: center; color: #7f8c8d; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>
                    <h2 style='color: #FF3B30;'>VibeTunes</h2>
                    <p>Hi there,</p>
                    <p>You recently requested to reset your VibeTunes password. Please use the following verification code to proceed:</p>
                    <p style='font-size: 24px; font-weight: bold; margin: 20px 0;'>{code}</p>
                    <p>This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
                    <br />
                    <p>Thanks,<br/>The VibeTunes Team</p>
                </div>
    
                <div class='footer'>
                    <p>Need help? Contact our support team at 
                    <a href='mailto:support@vibetunes.com'>support@vibetunes.com</a></p>
                    <p>© 2025 VibeTunes. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
        
        await gmailService.SendEmailAsync(
            request.Email,
            "🎧 VibeTunes Password Reset Request",
            emailBody);
        
        await unitOfWork.CommitAsync();
        
        return Task.CompletedTask;
    }
}