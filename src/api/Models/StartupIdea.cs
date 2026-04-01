using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class StartupIdea
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required][MaxLength(200)] public string Title { get; set; } = string.Empty;

    // From chat module
    public string? IdeaDescription { get; set; }
    public string? ProblemStatement { get; set; }
    [MaxLength(500)] public string? TargetAudience { get; set; }
    [MaxLength(500)] public string? BusinessModel { get; set; }

    // From design module (DALL-E)
    public string? CoverImageUrl { get; set; }
    [MaxLength(500)] public string? CoverImagePrompt { get; set; }

    // From story book
    [MaxLength(200)] public string? StoryTitle { get; set; }
    public string? StoryBody { get; set; }

    // From agent builder
    [MaxLength(200)] public string? AgentName { get; set; }
    public string? AgentSystemPrompt { get; set; }
    [MaxLength(100)] public string? AgentModel { get; set; }
    public double? AgentTemperature { get; set; }

    // From web builder
    [MaxLength(500)] public string? WebsiteUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
