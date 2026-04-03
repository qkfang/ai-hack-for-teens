using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/comics")]
public class ComicsController(AIHackDbContext db, IMemoryCache cache, IConfiguration config) : ControllerBase
{
    private static readonly TimeSpan DbCacheDuration = TimeSpan.FromMinutes(5);
    private bool CacheEnabled => config.GetValue<bool>("DbCacheEnabled");

    [HttpGet]
    public async Task<IActionResult> GetAllComics()
    {
        if (CacheEnabled && cache.TryGetValue("comics:all", out object? cached))
            return Ok(cached);

        cached = await db.Comics
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new { id = c.Id, description = c.Description, imageUrl = c.ImageUrl, createdAt = c.CreatedAt, userId = c.UserId, username = c.User.Username })
            .ToListAsync();

        if (CacheEnabled)
            cache.Set("comics:all", cached, DbCacheDuration);

        return Ok(cached);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserComics(int userId)
    {
        var comics = await db.Comics
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new { id = c.Id, description = c.Description, imageUrl = c.ImageUrl, createdAt = c.CreatedAt })
            .ToListAsync();
        return Ok(comics);
    }
}
