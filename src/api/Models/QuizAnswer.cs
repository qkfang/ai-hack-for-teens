using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class QuizAnswer
{
    public int Id { get; set; }
    [Required][MaxLength(100)] public string EventName { get; set; } = "";
    public int UserId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerIndex { get; set; }
}
