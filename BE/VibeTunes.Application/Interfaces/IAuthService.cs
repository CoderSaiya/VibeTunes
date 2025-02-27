using System.Security.Claims;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Entities;

namespace VibeTunes.Application.Interfaces;

public interface IAuthService
{
    public string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
    public Task<string?> RefreshTokenAsync(string refreshToken);
}