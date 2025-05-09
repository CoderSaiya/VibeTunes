﻿using System.Security.Claims;

namespace VibeTunes.Application.Interfaces;

public interface IAuthService
{
    public string HashPassword(string password);
    public bool VerifyPassword(string password, string hashedPassword);
    public string GenerateAccessToken(IEnumerable<Claim> claims);
    public string GenerateRefreshToken();
    public Task<string?> RefreshTokenAsync(string refreshToken);
}