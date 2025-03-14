using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;

namespace VibeTunes.Infrastructure.Persistence.Data;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Song> Songs { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<History> Histories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Tags)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries));
        
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Benefits)
            .HasConversion(
                v => string.Join(",", v),
                v => v.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries));

        modelBuilder.Entity<Album>()
            .Property(a => a.ReleaseDate)
            .HasConversion(
                d => d.ToDateTime(TimeOnly.MinValue),
                d => DateOnly.FromDateTime(d));
        
        modelBuilder.Entity<Song>()
            .HasMany(s => s.Genres)
            .WithMany(g => g.Songs)
            .UsingEntity<Dictionary<string, object>>(
                "SongGenres", // Tên bảng join
                j => j.HasOne<Genre>()
                    .WithMany()
                    .HasForeignKey("GenreId")
                    .HasConstraintName("FK_SongGenres_Genres_GenreId"),
                j => j.HasOne<Song>()
                    .WithMany()
                    .HasForeignKey("SongId")
                    .HasConstraintName("FK_SongGenres_Songs_SongId"),
                j =>
                {
                    j.HasKey("SongId", "GenreId");
                    j.ToTable("SongGenres");
                });

        modelBuilder.Entity<Profile>(profiles =>
        {
            profiles.OwnsOne(p => p.Address, a =>
            {
                a.Property(x => x.Street).HasColumnType("nvarchar(256)");
                a.Property(x => x.District).HasColumnType("nvarchar(100)");
                a.Property(x => x.City).HasColumnType("nvarchar(100)");
                a.Property(x => x.Country).HasColumnType("nvarchar(100)");
            });
            
            profiles.OwnsOne(p => p.Name, n =>
            {
                n.Property(x => x.FirstName).HasColumnType("nvarchar(100)");
                n.Property(x => x.LastName).HasColumnType("nvarchar(100)");
            });
        });

        modelBuilder.Entity<User>(users =>
        {
            users.OwnsOne(u => u.EmailAddress, e =>
            {
                e.Property(x => x.Value).HasColumnType("nvarchar(256)");
            });
            
            users.HasMany(u => u.Histories)
                .WithOne(h => h.User)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<Notification>()
            .HasOne(c => c.Sender)
            .WithMany(u => u.NotificationsSent)
            .HasForeignKey(c => c.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(c => c.Receiver)
            .WithMany(u => u.NotificationsReceived)
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<History>(entity =>
        {
            entity.HasOne(h => h.Song)
                .WithMany() 
                .HasForeignKey(h => h.SongId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        modelBuilder.Entity<Playlist>()
            .HasMany(p => p.Songs)
            .WithMany(s => s.Playlists)
            .UsingEntity<Dictionary<string, object>>(
                "PlaylistSong",
                j => j.HasOne<Song>()
                    .WithMany()
                    .HasForeignKey("SongsId")
                    .OnDelete(DeleteBehavior.Restrict),
                j => j.HasOne<Playlist>()
                    .WithMany()
                    .HasForeignKey("PlaylistsId")
                    .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("PlaylistsId", "SongsId");
                    j.ToTable("PlaylistSong");
                });
        
        base.OnModelCreating(modelBuilder);
    }
}