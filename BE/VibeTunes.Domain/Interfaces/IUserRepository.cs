using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Domain.Interfaces;

public interface IUserRepository
{
    Task AddAsync(User user);
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<IEnumerable<User>> GetAllAsync();
    Task<IEnumerable<User>> GetAllBannedAsync();
    Task<IEnumerable<User>> GetAllActiveAsync();
    public Task<IEnumerable<User>> GetUsersByFilterAsync(UserFilter userFilter);
    public Task<bool> UpdateUserAsync(User user);
    public Task<bool> DeleteUserAsync(Guid userId);
    public Task ReplaceUserAsync(User existingUser, Artist newArtist);
}