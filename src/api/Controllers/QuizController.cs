using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Services;

namespace api.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController(QuizStore quiz, AIHackDbContext db) : ControllerBase
{
    private const string AdminPassword = "9999";

    // ── Events management ────────────────────────────────────────────────────

    [HttpGet("events")]
    public IActionResult GetEvents() => Ok(quiz.GetEventNames());

    [HttpPost("admin/events")]
    public IActionResult AddEvent([FromBody] EventRequest req, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword) return Unauthorized(new { error = "Invalid admin password" });
        var name = req.Name?.Trim() ?? "";
        if (string.IsNullOrEmpty(name)) return BadRequest(new { error = "Event name is required" });
        if (!quiz.AddEvent(name)) return Conflict(new { error = "Event already exists" });
        return Ok(quiz.GetEventNames());
    }

    [HttpDelete("admin/events/{name}")]
    public IActionResult RemoveEvent(string name, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword) return Unauthorized(new { error = "Invalid admin password" });
        if (!quiz.RemoveEvent(name)) return NotFound(new { error = "Event not found" });
        return Ok(quiz.GetEventNames());
    }

    // ── Quiz state ───────────────────────────────────────────────────────────

    [HttpGet("state")]
    public IActionResult GetState([FromQuery] int? userId, [FromQuery] string? eventName)
    {
        var ev = quiz.GetEvent(eventName ?? "");
        var q = ev.CurrentQuestion;
        var status = ev.Status;
        var showAnswer = ev.IsShowingAnswer;
        var question = status == EventQuizState.QuizStatus.InProgress
            ? new
            {
                text = QuizStore.Questions[q].Text,
                options = QuizStore.Questions[q].Options,
            }
            : (object?)null;

        return Ok(new
        {
            status = status.ToString().ToLower(),
            currentQuestion = q,
            totalQuestions = QuizStore.Questions.Length,
            question,
            hasAnswered = userId.HasValue && ev.HasAnswered(userId.Value, q),
            showAnswer,
            correctIndex = (status == EventQuizState.QuizStatus.InProgress && ev.IsShowingAnswer) ? QuizStore.Questions[q].CorrectIndex : (int?)null,
        });
    }

    [HttpPost("answer")]
    public IActionResult SubmitAnswer([FromBody] AnswerRequest req)
    {
        var ev = quiz.GetEvent(req.EventName ?? "");
        if (ev.Status != EventQuizState.QuizStatus.InProgress)
            return BadRequest(new { error = "Quiz is not in progress" });

        var q = ev.CurrentQuestion;
        if (!ev.SubmitAnswer(req.UserId, q, req.Answer))
            return BadRequest(new { error = "Already answered this question" });

        bool correct = req.Answer == QuizStore.Questions[q].CorrectIndex;
        return Ok(new { correct });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string? eventName)
    {
        var ev = quiz.GetEvent(eventName ?? "");
        IQueryable<api.Models.AppUser> query = db.AppUsers;
        if (!string.IsNullOrWhiteSpace(eventName))
            query = query.Where(u => u.EventName == eventName);

        var users = await query
            .Select(u => new { userId = u.Id, username = u.Username })
            .ToListAsync();
        var board = users
            .Select(u => new { u.userId, u.username, score = ev.GetScore(u.userId) })
            .OrderByDescending(x => x.score)
            .ToList();
        return Ok(board);
    }

    // ── Admin controls ───────────────────────────────────────────────────────

    [HttpPost("admin/control")]
    public IActionResult AdminControl([FromBody] AdminControlRequest req, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword)
            return Unauthorized(new { error = "Invalid admin password" });

        var ev = quiz.GetEvent(req.EventName ?? "");
        switch (req.Action)
        {
            case "start": ev.Start(); break;
            case "next": ev.Next(); break;
            case "prev": ev.Prev(); break;
            case "finish": ev.Finish(); break;
            case "reset": ev.Reset(); break;
            case "showAnswer": ev.ToggleShowAnswer(); break;
            default: return BadRequest(new { error = "Unknown action" });
        }

        return Ok(new { status = ev.Status.ToString().ToLower(), currentQuestion = ev.CurrentQuestion, showAnswer = ev.IsShowingAnswer });
    }
}

public record AnswerRequest(int UserId, int Answer, string? EventName);
public record AdminControlRequest(string Action, string? EventName);
public record EventRequest(string? Name);
