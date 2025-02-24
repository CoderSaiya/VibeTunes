using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VibeTunes.Infrastructure.Persistence.Data;
using MediatR;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Identity;
using VibeTunes.Infrastructure.Persistence.Repositories;

namespace VibeTunes.Infrastructure.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    connectionString:
                    "Data Source=DESKTOP-1FAVEMH\\SQLEXPRESS;Initial Catalog=VibeTunesDb;Integrated Security=True;trusted_connection=true;encrypt=false;",
                    sqlServerOptionsAction: sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                    }),
            contextLifetime: ServiceLifetime.Scoped,
            optionsLifetime: ServiceLifetime.Singleton);
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAlbumRepository, AlbumRepository>();
        services.AddScoped<IGenreRepository, GenreRepository>();
        services.AddScoped<IHistoryRepository, HistoryRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IPlaylistRepository, PlaylistRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IRefreshRepository, RefreshRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        return services;
    }
    
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(Assembly.GetExecutingAssembly());
        return services;
    }
}