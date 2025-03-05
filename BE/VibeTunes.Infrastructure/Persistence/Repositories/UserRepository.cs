using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    private readonly AppDbContext _context = context;

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Where(u => u.EmailAddress.Value == email)
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .Where(u => u.Username == username)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<IEnumerable<User>> GetAllBannedAsync()
    {
        return await _context.Users
            .Where(u => u.IsBanned == false)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetAllActiveAsync()
    {
        return await _context.Users
            .Where(u => u.IsActive == true)
            .ToListAsync();
    }

    public async Task<bool> UpdateUserAsync(User user)
    {
        var existingUser = await context.Users.FindAsync(user.Id);
        if (existingUser == null)
            return false;
        
        context.Entry(existingUser).CurrentValues.SetValues(user);
        return true;
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var existingUser = await context.Users.FindAsync(userId);
        if (existingUser == null)
            return false;
        
        context.Users.Remove(existingUser);
        return true;
    }
}