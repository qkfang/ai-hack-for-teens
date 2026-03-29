using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Comic
{
    public int Id { get; set; }
    public int UserId { get; set; }
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;
}
