using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/stories")]
public class StoriesController(WeatherDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllStories()
    {
        var stories = await db.Stories
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new { id = s.Id, title = s.Title, body = s.Body, coverImageUrl = s.CoverImageUrl, createdAt = s.CreatedAt, userId = s.UserId, username = s.User.Username })
            .ToListAsync();
        return Ok(stories);
    }
}
