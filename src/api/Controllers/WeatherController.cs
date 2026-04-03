using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using api.Data;
using api.Models;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class WeatherController(AIHackDbContext db, IMemoryCache cache, IConfiguration config) : ControllerBase
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private const string AllRecordsCacheKey = "weather:all";
    private bool CacheEnabled => config.GetValue<bool>("DbCacheEnabled");

    private void InvalidateCache() => cache.Remove(AllRecordsCacheKey);

    private async Task<List<WeatherRecord>> GetAllCachedAsync()
    {
        if (!CacheEnabled)
            return await db.WeatherRecords.OrderBy(w => w.City).ToListAsync();

        return (await cache.GetOrCreateAsync(AllRecordsCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            return await db.WeatherRecords.OrderBy(w => w.City).ToListAsync();
        }))!;
    }

    /// <summary>Get all weather records</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WeatherRecord>>> GetAll() =>
        await GetAllCachedAsync();

    /// <summary>Get weather record by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<WeatherRecord>> GetById(int id)
    {
        var records = await GetAllCachedAsync();
        var record = records.FirstOrDefault(w => w.Id == id);
        return record is null ? NotFound() : Ok(record);
    }

    /// <summary>Get weather for a specific city</summary>
    [HttpGet("city/{city}")]
    public async Task<ActionResult<WeatherRecord>> GetByCity(string city)
    {
        var records = await GetAllCachedAsync();
        var record = records.FirstOrDefault(w => w.City.Equals(city, StringComparison.OrdinalIgnoreCase));
        return record is null ? NotFound() : Ok(record);
    }

    /// <summary>Create a new weather record</summary>
    [HttpPost]
    public async Task<ActionResult<WeatherRecord>> Create(WeatherRecord record)
    {
        record.Id = 0;
        record.RecordedAt = DateTime.UtcNow;
        db.WeatherRecords.Add(record);
        await db.SaveChangesAsync();
        InvalidateCache();
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    /// <summary>Update an existing weather record</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, WeatherRecord record)
    {
        if (id != record.Id) return BadRequest();
        db.Entry(record).State = EntityState.Modified;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await db.WeatherRecords.AnyAsync(w => w.Id == id)) return NotFound();
            throw;
        }
        InvalidateCache();
        return NoContent();
    }

    /// <summary>Delete a weather record</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await db.WeatherRecords.FindAsync(id);
        if (record is null) return NotFound();
        db.WeatherRecords.Remove(record);
        await db.SaveChangesAsync();
        InvalidateCache();
        return NoContent();
    }

    /// <summary>Get a summary of weather conditions</summary>
    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetSummary()
    {
        var records = await GetAllCachedAsync();
        return Ok(new
        {
            TotalCities = records.Count,
            AverageTemperatureCelsius = records.Count > 0 ? Math.Round(records.Average(r => r.TemperatureCelsius), 1) : 0,
            HottestCity = records.OrderByDescending(r => r.TemperatureCelsius).FirstOrDefault()?.City,
            ColdestCity = records.OrderBy(r => r.TemperatureCelsius).FirstOrDefault()?.City,
            Conditions = records.GroupBy(r => r.Condition).ToDictionary(g => g.Key, g => g.Count())
        });
    }
}
