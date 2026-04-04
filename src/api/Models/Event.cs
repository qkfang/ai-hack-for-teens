using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Event
{
    public int Id { get; set; }
    [Required][MaxLength(100)] public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
