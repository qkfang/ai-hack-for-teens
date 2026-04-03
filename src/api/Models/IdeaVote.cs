namespace api.Models;

public class IdeaVote
{
    public int IdeaId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public StartupIdea Idea { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
