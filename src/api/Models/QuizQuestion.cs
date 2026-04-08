using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class QuizQuestion
{
    public int Id { get; set; }
    [Required] public string Text { get; set; } = "";
    [Required] public string OptionsJson { get; set; } = "[]";
    public int CorrectIndex { get; set; }
    public int DisplayOrder { get; set; }
}
