﻿using System.Security.Claims;
using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class LoginUserHandler(
    IAuthService authService, 
    IUserRepository userRepository,
    IRefreshRepository refreshRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<LoginUserCommand, LoginUserResult>
{
    public async Task<LoginUserResult> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        // check user exists
        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            throw new BusinessException("User with this email not exists.");
        
        // check password
        var passwordHash = authService.HashPassword(request.Password);
        if (!authService.VerifyPassword(passwordHash, user.Password)) 
            throw new BusinessException("Invalid password.");

        // check gmail active
        if (!string.IsNullOrEmpty(user.ActiveCode))
            throw new BusinessException("User not active.");

        // check if logged in
        var validToken = await refreshRepository.GetValidTokenByUserAsync(user.Id);
        if (validToken != null)
            // if true: revoke token
            validToken.IsRevoked = true;

        // issue new token
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.EmailAddress.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, (user is Artist) ? "Artist" : "User"),
        };
        
        var newAccessToken = authService.GenerateAccessToken(claims);
        var newRefreshToken = authService.GenerateRefreshToken();
        
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            
        };
        await refreshRepository.AddAsync(refreshToken);
        
        return new LoginUserResult(newAccessToken, newRefreshToken);
    }
}