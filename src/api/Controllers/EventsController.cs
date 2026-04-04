using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(AIHackDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        var events = await db.Events
            .OrderBy(e => e.Name)
            .Select(e => new { id = e.Id, name = e.Name, createdAt = e.CreatedAt })
            .ToListAsync();
        return Ok(events);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        var name = request.Name?.Trim() ?? "";
        if (string.IsNullOrEmpty(name))
            return BadRequest(new { error = "name is required" });

        var ev = new Event { Name = name };
        db.Events.Add(ev);
        await db.SaveChangesAsync();
        return StatusCode(201, new { id = ev.Id, name = ev.Name, createdAt = ev.CreatedAt });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        var ev = await db.Events.FindAsync(id);
        if (ev == null) return NotFound(new { error = "Event not found" });
        db.Events.Remove(ev);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateEventRequest(string? Name);
