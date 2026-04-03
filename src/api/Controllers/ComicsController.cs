using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;

namespace api.Controllers;

[ApiController]
[Route("api/comics")]
public class ComicsController(AIHackDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllComics()
    {
        var result = await db.Comics
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new { id = c.Id, description = c.Description, imageUrl = c.ImageUrl, createdAt = c.CreatedAt, userId = c.UserId, username = c.User.Username })
            .ToListAsync();

        return Ok(result);
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
