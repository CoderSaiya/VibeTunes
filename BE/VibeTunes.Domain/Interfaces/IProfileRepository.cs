using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface IProfileRepository
{
    public Task<IEnumerable<Profile>> GetAllProfilesAsync();
    public Task<Profile?> GetProfileByIdAsync(Guid profileId);
    public Task<Profile?> GetProfileByUserAsync(Guid userId);
    public Task<bool> CreateProfileAsync(Profile profile);
    public Task<bool> UpdateProfileAsync(Profile profile);
    public Task<bool> DeleteProfileAsync(Guid profileId);
}