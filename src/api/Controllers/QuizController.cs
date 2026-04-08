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
    public async Task<IActionResult> GetEvents() => Ok(await quiz.GetEventNamesAsync());

    [HttpPost("admin/events")]
    public async Task<IActionResult> AddEvent([FromBody] EventRequest req, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword) return Unauthorized(new { error = "Invalid admin password" });
        var name = req.Name?.Trim() ?? "";
        if (string.IsNullOrEmpty(name)) return BadRequest(new { error = "Event name is required" });
        if (!await quiz.AddEventAsync(name)) return Conflict(new { error = "Event already exists" });
        return Ok(await quiz.GetEventNamesAsync());
    }

    [HttpDelete("admin/events/{name}")]
    public async Task<IActionResult> RemoveEvent(string name, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword) return Unauthorized(new { error = "Invalid admin password" });
        if (!await quiz.RemoveEventAsync(name)) return NotFound(new { error = "Event not found" });
        return Ok(await quiz.GetEventNamesAsync());
    }

    // ── Quiz state ───────────────────────────────────────────────────────────

    [HttpGet("state")]
    public async Task<IActionResult> GetState([FromQuery] int? userId, [FromQuery] string? eventName)
    {
        var ev = await quiz.GetOrCreateEventStateAsync(eventName);
        var questions = await quiz.GetQuestionsAsync();
        var q = ev.CurrentQuestion;
        var statusText = ev.Status switch { 1 => "inprogress", 2 => "finished", _ => "waiting" };

        object? question = null;
        if (ev.Status == 1 && q < questions.Count)
        {
            var current = questions[q];
            question = new { text = current.Text, options = quiz.ParseOptions(current) };
        }

        var hasAnswered = false;
        int? correctIndex = null;
        if (ev.Status == 1 && q < questions.Count)
        {
            if (userId.HasValue)
                hasAnswered = await quiz.HasAnsweredAsync(eventName, userId.Value, questions[q].Id);
            if (ev.ShowAnswer)
                correctIndex = questions[q].CorrectIndex;
        }

        int score = 0;
        if (userId.HasValue)
        {
            var appUser = await db.AppUsers.FindAsync(userId.Value);
            if (appUser != null) score = appUser.Score;
        }

        return Ok(new
        {
            status = statusText,
            currentQuestion = q,
            totalQuestions = questions.Count,
            question,
            hasAnswered,
            showAnswer = ev.ShowAnswer,
            correctIndex,
            score,
        });
    }

    [HttpPost("answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] AnswerRequest req)
    {
        var ev = await quiz.GetOrCreateEventStateAsync(req.EventName);
        if (ev.Status != 1)
            return BadRequest(new { error = "Quiz is not in progress" });

        var questions = await quiz.GetQuestionsAsync();
        var q = ev.CurrentQuestion;
        if (q >= questions.Count) return BadRequest(new { error = "Invalid question" });

        var current = questions[q];
        if (!await quiz.SubmitAnswerAsync(req.EventName, req.UserId, current.Id, req.Answer))
            return BadRequest(new { error = "Already answered this question" });

        bool correct = req.Answer == current.CorrectIndex;
        return Ok(new { correct });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string? eventName)
    {
        IQueryable<api.Models.AppUser> query = db.AppUsers;
        if (!string.IsNullOrWhiteSpace(eventName))
            query = query.Where(u => u.EventName == eventName);

        var scores = await query
            .OrderByDescending(u => u.Score)
            .Select(u => new { userId = u.Id, username = u.Username, eventName = u.EventName, score = u.Score })
            .ToListAsync();

        return Ok(scores);
    }

    // ── Admin controls ───────────────────────────────────────────────────────

    [HttpPost("admin/control")]
    public async Task<IActionResult> AdminControl([FromBody] AdminControlRequest req, [FromHeader(Name = "X-Admin-Password")] string? password)
    {
        if (password != AdminPassword)
            return Unauthorized(new { error = "Invalid admin password" });

        switch (req.Action)
        {
            case "start": await quiz.StartAsync(req.EventName); break;
            case "next": await quiz.NextAsync(req.EventName); break;
            case "prev": await quiz.PrevAsync(req.EventName); break;
            case "finish": await quiz.FinishAsync(req.EventName); break;
            case "reset": await quiz.ResetAsync(req.EventName); break;
            case "showAnswer": await quiz.ToggleShowAnswerAsync(req.EventName); break;
            default: return BadRequest(new { error = "Unknown action" });
        }

        var ev = await quiz.GetOrCreateEventStateAsync(req.EventName);
        var statusText = ev.Status switch { 1 => "inprogress", 2 => "finished", _ => "waiting" };
        return Ok(new { status = statusText, currentQuestion = ev.CurrentQuestion, showAnswer = ev.ShowAnswer });
    }
}

public record AnswerRequest(int UserId, int Answer, string? EventName);
public record AdminControlRequest(string Action, string? EventName);
public record EventRequest(string? Name);
