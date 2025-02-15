using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class RefreshRepository : IRefreshRepository
{
    private readonly AppDbContext _context;

    public RefreshRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Where(t => t.Token == token)
            .FirstOrDefaultAsync();
    }

    public async Task AddAsync(RefreshToken refreshToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken);
    }

    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        var token = await _context.RefreshTokens.FindAsync(refreshToken.Id);
        if (token == null)
        {
            throw new KeyNotFoundException();
        }
        _context.Entry(token).CurrentValues.SetValues(refreshToken);
    }
}