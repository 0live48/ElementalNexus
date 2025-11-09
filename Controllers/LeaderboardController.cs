using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly GameDbContext _context;
    public LeaderboardController(GameDbContext context)
    {
        _context = context;
    }

    // Get all players sorted by score
    [HttpGet]
    public async Task<IEnumerable<Player>> GetLeaderboard()
    {
        return await _context.Players.OrderByDescending(p => p.Score).ToListAsync();
    }

    // Add or update a player
    [HttpPost]
    public async Task<IActionResult> AddOrUpdatePlayer([FromBody] Player player)
    {
        var existing = await _context.Players.FirstOrDefaultAsync(p => p.Name == player.Name);
        if (existing != null)
        {
            existing.Score = player.Score;
        }
        else
        {
            _context.Players.Add(player);
        }
        await _context.SaveChangesAsync();
        return Ok(player);
    }
}
