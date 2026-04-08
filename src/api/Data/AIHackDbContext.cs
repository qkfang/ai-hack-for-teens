using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data;

public class AIHackDbContext : DbContext
{
    public AIHackDbContext(DbContextOptions<AIHackDbContext> options) : base(options) { }

    public DbSet<WeatherRecord> WeatherRecords => Set<WeatherRecord>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Comic> Comics => Set<Comic>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StartupIdea> StartupIdeas => Set<StartupIdea>();
    public DbSet<IdeaVote> IdeaVotes => Set<IdeaVote>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizEventState> QuizEventStates => Set<QuizEventState>();
    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();

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

        modelBuilder.Entity<QuizQuestion>().Property(x => x.OptionsJson).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<QuizEventState>().HasIndex(x => x.EventName).IsUnique();
        modelBuilder.Entity<QuizAnswer>().HasIndex(x => new { x.EventName, x.UserId, x.QuestionId }).IsUnique();

        modelBuilder.Entity<QuizQuestion>().HasData(
            new QuizQuestion { Id = 1, DisplayOrder = 0, Text = "What does AI stand for?", OptionsJson = "[\"Automated Intelligence\",\"Artificial Intelligence\",\"Advanced Integration\",\"Applied Information\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 2, DisplayOrder = 1, Text = "Which Microsoft AI assistant is built into Windows 11 and Microsoft 365?", OptionsJson = "[\"Siri\",\"Alexa\",\"Copilot\",\"Bixby\"]", CorrectIndex = 2 },
            new QuizQuestion { Id = 3, DisplayOrder = 2, Text = "What is a Large Language Model (LLM)?", OptionsJson = "[\"A very big dictionary\",\"An AI trained on text to understand and generate language\",\"A programming language for AI\",\"A type of database\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 4, DisplayOrder = 3, Text = "Which of the following is one of Microsoft's 6 Responsible AI principles?", OptionsJson = "[\"Speed\",\"Fairness\",\"Profitability\",\"Complexity\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 5, DisplayOrder = 4, Text = "What is 'prompt engineering'?", OptionsJson = "[\"Building hardware for AI chips\",\"Designing prompts to get better AI outputs\",\"Writing AI source code\",\"Training neural networks\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 6, DisplayOrder = 5, Text = "In Microsoft's Responsible AI framework, which principle means AI should not disadvantage people based on race, gender, or other factors?", OptionsJson = "[\"Reliability\",\"Privacy\",\"Fairness\",\"Accountability\"]", CorrectIndex = 2 },
            new QuizQuestion { Id = 7, DisplayOrder = 6, Text = "What is Microsoft Foundry?", OptionsJson = "[\"A cloud platform for building and deploying AI models and applications\",\"A robot manufacturing facility\",\"A Microsoft gaming service\",\"A programming language\"]", CorrectIndex = 0 },
            new QuizQuestion { Id = 8, DisplayOrder = 7, Text = "What does 'AI bias' mean?", OptionsJson = "[\"AI that prefers certain programming languages\",\"When AI produces unfair or skewed results due to flawed training data\",\"The speed difference between AI models\",\"AI that only works in one country\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 9, DisplayOrder = 8, Text = "Which Microsoft Responsible AI principle ensures humans remain in control of AI decisions?", OptionsJson = "[\"Transparency\",\"Human oversight and control (Accountability)\",\"Inclusiveness\",\"Reliability\"]", CorrectIndex = 1 },
            new QuizQuestion { Id = 10, DisplayOrder = 9, Text = "What is 'machine learning'?", OptionsJson = "[\"Teaching robots to walk\",\"A type of AI where systems learn patterns from data without being explicitly programmed\",\"Writing code that runs very fast\",\"A Microsoft Office feature\"]", CorrectIndex = 1 }
        );
    }
}
