using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/comics")]
public class ComicsController(AIHackDbContext db, IMemoryCache cache) : ControllerBase
{
    private static readonly TimeSpan DbCacheDuration = TimeSpan.FromMinutes(5);

    [HttpGet]
    public async Task<IActionResult> GetAllComics()
    {
        if (!cache.TryGetValue("comics:all", out object? cached))
        {
            cached = await db.Comics
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new { id = c.Id, description = c.Description, imageUrl = c.ImageUrl, createdAt = c.CreatedAt, userId = c.UserId, username = c.User.Username })
                .ToListAsync();
            cache.Set("comics:all", cached, DbCacheDuration);
        }
        return Ok(cached);
    }
}
