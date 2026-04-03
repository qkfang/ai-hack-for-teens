using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("api/ideas")]
public class StartupIdeasController(AIHackDbContext db, IMemoryCache cache) : ControllerBase
{
    private static readonly TimeSpan DbCacheDuration = TimeSpan.FromMinutes(5);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (!cache.TryGetValue("ideas:all", out object? cached))
        {
            cached = await db.StartupIdeas
                .Include(i => i.User)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new
                {
                    id = i.Id,
                    userId = i.UserId,
                    username = i.User.Username,
                    title = i.Title,
                    ideaDescription = i.IdeaDescription,
                    problemStatement = i.ProblemStatement,
                    targetAudience = i.TargetAudience,
                    businessModel = i.BusinessModel,
                    coverImageUrl = i.CoverImageUrl,
                    coverImagePrompt = i.CoverImagePrompt,
                    agentName = i.AgentName,
                    agentSystemPrompt = i.AgentSystemPrompt,
                    agentModel = i.AgentModel,
                    agentTemperature = i.AgentTemperature,
                    websiteUrl = i.WebsiteUrl,
                    isPublished = i.IsPublished,
                    createdAt = i.CreatedAt,
                    updatedAt = i.UpdatedAt,
                })
                .ToListAsync();
            cache.Set("ideas:all", cached, DbCacheDuration);
        }
        return Ok(cached);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var cacheKey = $"ideas:{id}";
        if (!cache.TryGetValue(cacheKey, out object? cached))
        {
            var i = await db.StartupIdeas.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
            if (i == null) return NotFound(new { error = "Idea not found" });
            cached = new
            {
                id = i.Id,
                userId = i.UserId,
                username = i.User.Username,
                title = i.Title,
                ideaDescription = i.IdeaDescription,
                problemStatement = i.ProblemStatement,
                targetAudience = i.TargetAudience,
                businessModel = i.BusinessModel,
                coverImageUrl = i.CoverImageUrl,
                coverImagePrompt = i.CoverImagePrompt,
                agentName = i.AgentName,
                agentSystemPrompt = i.AgentSystemPrompt,
                agentModel = i.AgentModel,
                agentTemperature = i.AgentTemperature,
                websiteUrl = i.WebsiteUrl,
                isPublished = i.IsPublished,
                createdAt = i.CreatedAt,
                updatedAt = i.UpdatedAt,
            };
            cache.Set(cacheKey, cached, DbCacheDuration);
        }
        return Ok(cached);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] IdeaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "title is required" });
        if (!await db.AppUsers.AnyAsync(u => u.Id == request.UserId))
            return NotFound(new { error = "User not found" });

        var idea = new StartupIdea
        {
            UserId = request.UserId,
            Title = request.Title.Trim(),
            IdeaDescription = request.IdeaDescription,
            ProblemStatement = request.ProblemStatement,
            TargetAudience = request.TargetAudience,
            BusinessModel = request.BusinessModel,
            CoverImageUrl = request.CoverImageUrl,
            CoverImagePrompt = request.CoverImagePrompt,
            AgentName = request.AgentName,
            AgentSystemPrompt = request.AgentSystemPrompt,
            AgentModel = request.AgentModel,
            AgentTemperature = request.AgentTemperature,
            WebsiteUrl = request.WebsiteUrl,
        };
        db.StartupIdeas.Add(idea);
        await db.SaveChangesAsync();
        cache.Remove("ideas:all");
        return StatusCode(201, new { id = idea.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] IdeaRequest request)
    {
        var idea = await db.StartupIdeas.FindAsync(id);
        if (idea == null) return NotFound(new { error = "Idea not found" });
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "title is required" });

        idea.Title = request.Title.Trim();
        idea.IdeaDescription = request.IdeaDescription;
        idea.ProblemStatement = request.ProblemStatement;
        idea.TargetAudience = request.TargetAudience;
        idea.BusinessModel = request.BusinessModel;
        idea.CoverImageUrl = request.CoverImageUrl;
        idea.CoverImagePrompt = request.CoverImagePrompt;
        idea.AgentName = request.AgentName;
        idea.AgentSystemPrompt = request.AgentSystemPrompt;
        idea.AgentModel = request.AgentModel;
        idea.AgentTemperature = request.AgentTemperature;
        idea.WebsiteUrl = request.WebsiteUrl;
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        cache.Remove("ideas:all");
        cache.Remove($"ideas:{id}");
        return Ok(new { id = idea.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var idea = await db.StartupIdeas.FindAsync(id);
        if (idea == null) return NotFound(new { error = "Idea not found" });
        db.StartupIdeas.Remove(idea);
        await db.SaveChangesAsync();
        cache.Remove("ideas:all");
        cache.Remove($"ideas:{id}");
        return NoContent();
    }

    [HttpPatch("{id:int}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        var idea = await db.StartupIdeas.FindAsync(id);
        if (idea == null) return NotFound(new { error = "Idea not found" });
        idea.IsPublished = true;
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        cache.Remove("ideas:all");
        cache.Remove($"ideas:{id}");
        return Ok(new { id = idea.Id, isPublished = idea.IsPublished });
    }

    [HttpPatch("{id:int}/unpublish")]
    public async Task<IActionResult> Unpublish(int id)
    {
        var idea = await db.StartupIdeas.FindAsync(id);
        if (idea == null) return NotFound(new { error = "Idea not found" });
        idea.IsPublished = false;
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        cache.Remove("ideas:all");
        cache.Remove($"ideas:{id}");
        return Ok(new { id = idea.Id, isPublished = idea.IsPublished });
    }
}

public record IdeaRequest(
    int UserId,
    string? Title,
    string? IdeaDescription,
    string? ProblemStatement,
    string? TargetAudience,
    string? BusinessModel,
    string? CoverImageUrl,
    string? CoverImagePrompt,
    string? AgentName,
    string? AgentSystemPrompt,
    string? AgentModel,
    double? AgentTemperature,
    string? WebsiteUrl);
