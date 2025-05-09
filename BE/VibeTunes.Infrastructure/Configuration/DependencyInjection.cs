using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VibeTunes.Infrastructure.Persistence.Data;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Factories;
using VibeTunes.Infrastructure.Hubs;
using VibeTunes.Infrastructure.Identity;
using VibeTunes.Infrastructure.Persistence.Repositories;
using VibeTunes.Infrastructure.Services;

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
        services.AddScoped<ISongRepository, SongRepository>();
        services.AddScoped<ISongLogRepository, SongLogRepository>();
        services.AddScoped<IStatisticsRepository, StatisticsRepository>();
        
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IGmailService, GmailService>();
        services.AddScoped<IFileService, S3FileService>();
        services.AddScoped<IRecommendationService, RecommendationService>();
        
        services.AddScoped<StripeGateway>();
        services.AddScoped<MomoGateway>();
        services.AddScoped<PaymentGatewayFactory>();
        
        services.AddSingleton<IBackgroundTaskQueue>(new BackgroundTaskQueue(capacity: 100));
        services.AddHostedService<QueuedHostedService>();
        services.AddSingleton<IUserIdProvider, NameUserIdProvider>();
        
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        services.AddSignalR();
        
        return services;
    }
    
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(Assembly.GetExecutingAssembly());
        return services;
    }
}