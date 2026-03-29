using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(WeatherDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var username = request.Username?.Trim() ?? "";
        if (string.IsNullOrEmpty(username))
            return BadRequest(new { error = "username is required" });

        var user = new AppUser { Username = username };
        db.AppUsers.Add(user);
        await db.SaveChangesAsync();
        return StatusCode(201, new { id = user.Id, username = user.Username, createdAt = user.CreatedAt });
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.AppUsers
            .Select(u => new { id = u.Id, username = u.Username, createdAt = u.CreatedAt, comicCount = u.Comics.Count })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await db.AppUsers.FindAsync(id);
        if (user == null) return NotFound(new { error = "User not found" });
        return Ok(new { id = user.Id, username = user.Username, createdAt = user.CreatedAt });
    }

    [HttpGet("{id:int}/comics")]
    public async Task<IActionResult> GetUserComics(int id)
    {
        if (!await db.AppUsers.AnyAsync(u => u.Id == id))
            return NotFound(new { error = "User not found" });
        var comics = await db.Comics
            .Where(c => c.UserId == id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new { id = c.Id, description = c.Description, imageUrl = c.ImageUrl, createdAt = c.CreatedAt })
            .ToListAsync();
        return Ok(comics);
    }

    [HttpPost("{id:int}/comics")]
    public async Task<IActionResult> AddUserComic(int id, [FromBody] AddComicRequest request)
    {
        if (!await db.AppUsers.AnyAsync(u => u.Id == id))
            return NotFound(new { error = "User not found" });

        var description = request.Description?.Trim() ?? "";
        var imageUrl = request.ImageUrl?.Trim() ?? "";
        if (string.IsNullOrEmpty(description) || string.IsNullOrEmpty(imageUrl))
            return BadRequest(new { error = "description and imageUrl are required" });

        var comic = new Comic { UserId = id, Description = description, ImageUrl = imageUrl };
        db.Comics.Add(comic);
        await db.SaveChangesAsync();
        return StatusCode(201, new { id = comic.Id, description = comic.Description, imageUrl = comic.ImageUrl, createdAt = comic.CreatedAt });
    }

    [HttpGet("{id:int}/stories")]
    public async Task<IActionResult> GetUserStories(int id)
    {
        if (!await db.AppUsers.AnyAsync(u => u.Id == id))
            return NotFound(new { error = "User not found" });
        var stories = await db.Stories
            .Where(s => s.UserId == id)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new { id = s.Id, title = s.Title, body = s.Body, coverImageUrl = s.CoverImageUrl, createdAt = s.CreatedAt })
            .ToListAsync();
        return Ok(stories);
    }

    [HttpPost("{id:int}/stories")]
    public async Task<IActionResult> AddUserStory(int id, [FromBody] AddStoryRequest request)
    {
        if (!await db.AppUsers.AnyAsync(u => u.Id == id))
            return NotFound(new { error = "User not found" });

        var title = request.Title?.Trim() ?? "";
        var body = request.Body?.Trim() ?? "";
        if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(body))
            return BadRequest(new { error = "title and body are required" });

        var story = new Story { UserId = id, Title = title, Body = body, CoverImageUrl = request.CoverImageUrl?.Trim() ?? "" };
        db.Stories.Add(story);
        await db.SaveChangesAsync();
        return StatusCode(201, new { id = story.Id, title = story.Title, body = story.Body, coverImageUrl = story.CoverImageUrl, createdAt = story.CreatedAt });
    }
}

public record CreateUserRequest(string? Username);
public record AddComicRequest(string? Description, string? ImageUrl);
public record AddStoryRequest(string? Title, string? Body, string? CoverImageUrl);
