using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using api.Data;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SettingsController(AIHackDbContext db) : ControllerBase
{
    private const string NavConfigKey = "nav-config";

    /// <summary>Get the nav config setting</summary>
    [HttpGet("nav")]
    public async Task<ActionResult> GetNav()
    {
        var setting = await db.AppSettings.FindAsync(NavConfigKey);
        if (setting is null) return NotFound();
        return Content(setting.Value, "application/json");
    }

    /// <summary>Update the nav config setting</summary>
    [HttpPut("nav")]
    public async Task<IActionResult> UpdateNav([FromBody] JsonElement value)
    {
        var json = value.GetRawText();
        if (string.IsNullOrWhiteSpace(json)) return BadRequest();

        var setting = await db.AppSettings.FindAsync(NavConfigKey);
        if (setting is null)
        {
            db.AppSettings.Add(new AppSetting { Key = NavConfigKey, Value = json });
        }
        else
        {
            setting.Value = json;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }
}
