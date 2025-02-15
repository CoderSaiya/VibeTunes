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

    public Task<User?> GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Where(u => u.EmailAddress.ToString() == email)
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
}