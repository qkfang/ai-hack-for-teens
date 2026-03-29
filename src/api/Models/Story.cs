using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Story
{
    public int Id { get; set; }
    public int UserId { get; set; }
    [Required][MaxLength(200)] public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
