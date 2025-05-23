﻿using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Domain.Specifications;
using VibeTunes.Infrastructure.Persistence.Data;
using System.Linq.Dynamic.Core;
using VibeTunes.Domain.ValueObjects;

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
        return await _context.Users
            .Include(u => u.Profile)
            .Where(u => u.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Artist?> GetArtistByIdAsync(Guid id)
    {
        return await _context.Artists
            .Include(a => a.Profile)
            .Include(a => a.Songs)
            .Include(a => a.Albums)
            .Include(a => a.Followers)
            .Where(a => a.Id == id)
            .FirstOrDefaultAsync();
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
    
    public async Task<IEnumerable<User>> GetUsersByFilterAsync(UserFilter userFilter, bool isArtist = true)
    {
        IQueryable<User> query = context.Users
            .Include(u => u.Profile)
            .AsQueryable();

        if (isArtist)
        {
            query = query.OfType<Artist>();
        }
        
        if (!string.IsNullOrEmpty(userFilter.Name))
        {
            var searchTerms = userFilter.Name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (searchTerms.Length == 1)
            {
                string term = searchTerms[0];
                query = query.Where(u => u.Profile.Name != null && 
                                         (EF.Functions.Like(u.Profile.Name.FirstName, $"%{term}%") ||
                                          EF.Functions.Like(u.Profile.Name.LastName, $"%{term}%")));
            }
            else if (searchTerms.Length == 2)
            {
                string firstTerm = searchTerms[0];
                string lastTerm = searchTerms[1];
                query = query.Where(u => u.Profile.Name != null && 
                                         (EF.Functions.Like(u.Profile.Name.FirstName, $"%{firstTerm}%") &&
                                          EF.Functions.Like(u.Profile.Name.LastName, $"%{lastTerm}%")));
            }
            else
            {
                foreach (var term in searchTerms)
                {
                    string currentTerm = term;
                    query = query.Where(u =>
                        u.Profile.Name != null && 
                        EF.Functions.Like(u.Profile.Name.FirstName + " " + u.Profile.Name.LastName, $"%{currentTerm}%"));
                }
            }
        }
        
        if (!string.IsNullOrEmpty(userFilter.Address))
        {
            var parsedAddress = Address.Parse(userFilter.Address);
            query = query.Where(u =>
                u.Profile.Address != null &&
                u.Profile.Address.Country == parsedAddress.Country &&
                u.Profile.Address.City == parsedAddress.City &&
                u.Profile.Address.District == parsedAddress.District &&
                u.Profile.Address.Street == parsedAddress.Street
            );
        }
        
        if (userFilter.Gender.HasValue)
        {
            query = query.Where(u => u.Profile.Gender == userFilter.Gender);
        }

        if (userFilter.IsBanned.HasValue)
        {
            query = query.Where(u => u.IsBanned == userFilter.IsBanned);
        }

        if (userFilter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == userFilter.IsActive);
        }
        
        string orderByString = $"{userFilter.SortBy} {userFilter.SortDirection}";
        query = query.OrderBy(orderByString);
        
        query = query.Skip((userFilter.PageNumber - 1) * userFilter.PageSize).Take(userFilter.PageSize);

        return await query.ToListAsync();
    }

    public async Task<IEnumerable<Artist>> GetHotArtistAsync(int size)
    {
        const double followersWeight = 0.5;
        const double streamsWeight = 0.4;
        const double albumsWeight = 0.3;
        const double songsWeight = 0.2;
        
        return await context.Artists
            .Include(a => a.Songs)
            .Include(a => a.Albums)
            .Include(a => a.Followers)
            .Include(a => a.Profile)
            .Select(a => new
            {
                Artist = a,
                Score = 
                    a.Followers.Count * followersWeight +
                    a.Songs.Sum(s => s.Streams) * streamsWeight +
                    a.Albums.Count * albumsWeight +
                    a.Songs.Count * songsWeight
            })
            .OrderByDescending(x => x.Score)
            .Select(x => x.Artist)
            .Take(size)
            .ToListAsync();
    }

    public async Task<IEnumerable<GenreCount>> GetTopGenresAsync(Guid artistId, int top = 1)
    {
        return await context.Songs
            .AsNoTracking()
            .Where(s => s.ArtistId == artistId)
            .SelectMany(s => s.Genres)
            .GroupBy(g => g.GenreName)
            .Select(grp => new GenreCount {
                GenreName = grp.Key,
                Count = grp.Count()
            })
            .OrderByDescending(g => g.Count)
            .Take(top)
            .ToListAsync();
    }

    public async Task<IEnumerable<DateCount>> GetUserAndArtistCountsByMonthAsync(int? month = null, int? year = null)
    {
        var now = DateTime.UtcNow;
        var currentYear = year ?? now.Year;
        var currentMonth = month ?? now.Month;
        
        var startOfMonth = new DateTime(currentYear, currentMonth, 1);
        int lastDay = DateTime.DaysInMonth(currentYear, currentMonth);
        var endOfPeriod = (year == DateTime.UtcNow.Year && month == DateTime.UtcNow.Month)
            ? DateTime.UtcNow.Date
            : new DateTime(currentYear, currentMonth, lastDay);
        
        var thresholds = new List<DateTime>();
        for (int day = 1; day <= lastDay; day += 5)
        {
            thresholds.Add(new DateTime(currentYear, currentMonth, day));
        }
        
        if (!thresholds.Contains(endOfPeriod))
            thresholds.Add(endOfPeriod);
        
        var results = new List<DateCount>();
        foreach (var threshold in thresholds)
        {
            var userCount = await _context.Users
                .CountAsync(u => u.CreatedDate.Date <= threshold);
            
            var artistCount = await _context.Users
                .OfType<Artist>()
                .CountAsync(a => a.CreatedDate.Date <= threshold);

            results.Add(new DateCount
            {
                Name = threshold.ToString("MMM d"),
                TotalUsers = userCount,
                TotalArtists = artistCount
            });
        }
        return results;
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
    
    public async Task ReplaceUserAsync(User existingUser, Artist newArtist)
    {
        var strategy = context.Database.CreateExecutionStrategy();
        
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Users.Remove(existingUser);
                
                _context.Users.Add(newArtist);

                _context.Entry(newArtist).Property(x => x.Id).IsModified = false;
                _context.Entry(newArtist).Property(x => x.CreatedDate).IsModified = false;
                
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }
}