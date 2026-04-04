using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class AppUser
{
    public int Id { get; set; }
    [Required][MaxLength(100)] public string Username { get; set; } = string.Empty;
    [MaxLength(50)] public string EventName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comic> Comics { get; set; } = [];
    public ICollection<Story> Stories { get; set; } = [];
    public ICollection<StartupIdea> StartupIdeas { get; set; } = [];
}
