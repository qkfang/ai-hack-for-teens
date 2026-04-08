using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class QuizEventState
{
    public int Id { get; set; }
    [Required][MaxLength(100)] public string EventName { get; set; } = "";
    public int Status { get; set; } // 0=Waiting, 1=InProgress, 2=Finished
    public int CurrentQuestion { get; set; }
    public bool ShowAnswer { get; set; }
}
