using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/stories")]
public class StoriesController(AIHackDbContext db, IMemoryCache cache) : ControllerBase
{
    private static readonly TimeSpan DbCacheDuration = TimeSpan.FromMinutes(5);

    [HttpGet]
    public async Task<IActionResult> GetAllStories()
    {
        if (!cache.TryGetValue("stories:all", out object? cached))
        {
            cached = await db.Stories
                .Include(s => s.User)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new { id = s.Id, title = s.Title, body = s.Body, coverImageUrl = s.CoverImageUrl, createdAt = s.CreatedAt, userId = s.UserId, username = s.User.Username })
                .ToListAsync();
            cache.Set("stories:all", cached, DbCacheDuration);
        }
        return Ok(cached);
    }
}
