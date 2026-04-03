using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data;

public class AIHackDbContext : DbContext
{
    public AIHackDbContext(DbContextOptions<AIHackDbContext> options) : base(options) { }

    public DbSet<WeatherRecord> WeatherRecords => Set<WeatherRecord>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Comic> Comics => Set<Comic>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StartupIdea> StartupIdeas => Set<StartupIdea>();
    public DbSet<IdeaVote> IdeaVotes => Set<IdeaVote>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<WeatherRecord>().HasData(
            new WeatherRecord { Id = 1, City = "New York", Condition = "Sunny", TemperatureCelsius = 22.5, Humidity = 55, WindSpeedKmh = 15, RecordedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new WeatherRecord { Id = 2, City = "London", Condition = "Cloudy", TemperatureCelsius = 14.0, Humidity = 72, WindSpeedKmh = 20, RecordedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new WeatherRecord { Id = 3, City = "Tokyo", Condition = "Rainy", TemperatureCelsius = 18.0, Humidity = 85, WindSpeedKmh = 10, RecordedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new WeatherRecord { Id = 4, City = "Sydney", Condition = "Partly Cloudy", TemperatureCelsius = 26.0, Humidity = 60, WindSpeedKmh = 25, RecordedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new WeatherRecord { Id = 5, City = "Paris", Condition = "Clear", TemperatureCelsius = 19.5, Humidity = 50, WindSpeedKmh = 12, RecordedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<AppSetting>().Property(x => x.Value).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<AppSetting>().HasData(
            new AppSetting
            {
                Key = "nav-config",
                Value = "{\"genai\":{\"chat\":false,\"translation\":false,\"speech\":false,\"realtime\":false},\"startup\":{\"ideas\":false,\"storybook\":false,\"comic\":false,\"agent\":false,\"webbuilder\":false},\"gallery\":true,\"quiz\":true}"
            }
        );

        modelBuilder.Entity<Comic>().Property(x => x.ImageUrl).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<Story>().Property(x => x.Body).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<Story>().Property(x => x.CoverImageUrl).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.IdeaDescription).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.ProblemStatement).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.AgentSystemPrompt).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.CoverImageUrl).HasColumnType("nvarchar(max)");

        modelBuilder.Entity<IdeaVote>().HasKey(v => new { v.IdeaId, v.UserId });
        modelBuilder.Entity<IdeaVote>()
            .HasOne(v => v.Idea)
            .WithMany()
            .HasForeignKey(v => v.IdeaId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<IdeaVote>()
            .HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
