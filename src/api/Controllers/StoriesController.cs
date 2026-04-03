using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/stories")]
public class StoriesController(AIHackDbContext db, IMemoryCache cache, IConfiguration config) : ControllerBase
{
    private static readonly TimeSpan DbCacheDuration = TimeSpan.FromMinutes(5);
    private bool CacheEnabled => config.GetValue<bool>("DbCacheEnabled");

    [HttpGet]
    public async Task<IActionResult> GetAllStories()
    {
        if (CacheEnabled && cache.TryGetValue("stories:all", out object? cached))
            return Ok(cached);

        cached = await db.Stories
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new { id = s.Id, title = s.Title, body = s.Body, coverImageUrl = s.CoverImageUrl, createdAt = s.CreatedAt, userId = s.UserId, username = s.User.Username })
            .ToListAsync();

        if (CacheEnabled)
            cache.Set("stories:all", cached, DbCacheDuration);

        return Ok(cached);
    }
}
