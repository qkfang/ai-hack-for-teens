using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data;

public class WeatherDbContext : DbContext
{
    public WeatherDbContext(DbContextOptions<WeatherDbContext> options) : base(options) { }

    public DbSet<WeatherRecord> WeatherRecords => Set<WeatherRecord>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Comic> Comics => Set<Comic>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StartupIdea> StartupIdeas => Set<StartupIdea>();

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

        modelBuilder.Entity<Comic>().Property(x => x.ImageUrl).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<Story>().Property(x => x.Body).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<Story>().Property(x => x.CoverImageUrl).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.IdeaDescription).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.ProblemStatement).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.AgentSystemPrompt).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<StartupIdea>().Property(x => x.CoverImageUrl).HasColumnType("nvarchar(max)");
    }
}
