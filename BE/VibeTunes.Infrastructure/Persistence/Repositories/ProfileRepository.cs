using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class ProfileRepository(AppDbContext context) : IProfileRepository
{
    public async Task<IEnumerable<Profile>> GetAllProfilesAsync()
    {
        return await context.Profiles.ToListAsync();
    }

    public async Task<Profile?> GetProfileByIdAsync(Guid profileId)
    {
        return await context.Profiles.FindAsync(profileId);
    }

    public async Task<Profile?> GetProfileByUserAsync(Guid userId)
    {
        return await context.Profiles
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> CreateProfileAsync(Profile profile)
    {
        try
        {
            await context.Profiles.AddAsync(profile);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateProfileAsync(Profile profile)
    {
        var existingProfile = await GetProfileByIdAsync(profile.Id);
        if (existingProfile == null)
            return false;
        
        context.Entry(existingProfile).CurrentValues.SetValues(profile);
        return true;
    }

    public async Task<bool> DeleteProfileAsync(Guid profileId)
    {
        var existingProfile = await GetProfileByIdAsync(profileId);
        if(existingProfile == null)
            return false;
        
        context.Profiles.Remove(existingProfile);
        return true;
    }
}