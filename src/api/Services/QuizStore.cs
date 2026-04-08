using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Services;

public class QuizStore(AIHackDbContext db)
{
    public async Task<List<QuizQuestion>> GetQuestionsAsync()
    {
        return await db.QuizQuestions.OrderBy(q => q.DisplayOrder).ToListAsync();
    }

    public string[] ParseOptions(QuizQuestion q)
    {
        return JsonSerializer.Deserialize<string[]>(q.OptionsJson) ?? [];
    }

    public async Task<List<string>> GetEventNamesAsync()
    {
        return await db.QuizEventStates.Select(e => e.EventName).ToListAsync();
    }

    public async Task<bool> AddEventAsync(string name)
    {
        var trimmed = name.Trim();
        if (await db.QuizEventStates.AnyAsync(e => e.EventName == trimmed)) return false;
        db.QuizEventStates.Add(new QuizEventState { EventName = trimmed });
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveEventAsync(string name)
    {
        var state = await db.QuizEventStates.FirstOrDefaultAsync(e => e.EventName == name);
        if (state == null) return false;
        db.QuizAnswers.RemoveRange(db.QuizAnswers.Where(a => a.EventName == name));
        db.QuizEventStates.Remove(state);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<QuizEventState> GetOrCreateEventStateAsync(string? eventName)
    {
        var key = string.IsNullOrWhiteSpace(eventName) ? "default" : eventName.Trim();
        var state = await db.QuizEventStates.FirstOrDefaultAsync(e => e.EventName == key);
        if (state == null)
        {
            state = new QuizEventState { EventName = key };
            db.QuizEventStates.Add(state);
            await db.SaveChangesAsync();
        }
        return state;
    }

    public async Task StartAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        state.Status = 1;
        state.CurrentQuestion = 0;
        state.ShowAnswer = false;
        await db.SaveChangesAsync();
    }

    public async Task NextAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        if (state.Status != 1) return;
        var totalQuestions = await db.QuizQuestions.CountAsync();
        if (state.CurrentQuestion < totalQuestions - 1)
        {
            state.CurrentQuestion++;
            state.ShowAnswer = false;
            await db.SaveChangesAsync();
        }
    }

    public async Task PrevAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        if (state.Status != 1) return;
        if (state.CurrentQuestion > 0)
        {
            state.CurrentQuestion--;
            state.ShowAnswer = false;
            await db.SaveChangesAsync();
        }
    }

    public async Task FinishAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        state.Status = 2;
        await db.SaveChangesAsync();
    }

    public async Task ResetAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        state.Status = 0;
        state.CurrentQuestion = 0;
        state.ShowAnswer = false;
        var key = string.IsNullOrWhiteSpace(eventName) ? "default" : eventName.Trim();
        db.QuizAnswers.RemoveRange(db.QuizAnswers.Where(a => a.EventName == key));

        var users = await db.AppUsers.Where(u => u.EventName == key).ToListAsync();
        foreach (var u in users) u.Score = 0;

        await db.SaveChangesAsync();
    }

    public async Task ToggleShowAnswerAsync(string? eventName)
    {
        var state = await GetOrCreateEventStateAsync(eventName);
        state.ShowAnswer = !state.ShowAnswer;
        await db.SaveChangesAsync();
    }

    public async Task<bool> SubmitAnswerAsync(string? eventName, int userId, int questionId, int answerIndex)
    {
        var key = string.IsNullOrWhiteSpace(eventName) ? "default" : eventName.Trim();
        if (await db.QuizAnswers.AnyAsync(a => a.EventName == key && a.UserId == userId && a.QuestionId == questionId))
            return false;
        db.QuizAnswers.Add(new QuizAnswer { EventName = key, UserId = userId, QuestionId = questionId, AnswerIndex = answerIndex });

        var question = await db.QuizQuestions.FindAsync(questionId);
        if (question != null && answerIndex == question.CorrectIndex)
        {
            var user = await db.AppUsers.FindAsync(userId);
            if (user != null) user.Score++;
        }

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasAnsweredAsync(string? eventName, int userId, int questionId)
    {
        var key = string.IsNullOrWhiteSpace(eventName) ? "default" : eventName.Trim();
        return await db.QuizAnswers.AnyAsync(a => a.EventName == key && a.UserId == userId && a.QuestionId == questionId);
    }

    public async Task<int> GetScoreAsync(string? eventName, int userId)
    {
        var key = string.IsNullOrWhiteSpace(eventName) ? "default" : eventName.Trim();
        var answers = await db.QuizAnswers.Where(a => a.EventName == key && a.UserId == userId).ToListAsync();
        var questions = await db.QuizQuestions.ToDictionaryAsync(q => q.Id);
        return answers.Count(a => questions.TryGetValue(a.QuestionId, out var q) && a.AnswerIndex == q.CorrectIndex);
    }
}
