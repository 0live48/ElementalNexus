using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class PlayersController : ControllerBase
{
    private readonly GameDbContext _db;
    public PlayersController(GameDbContext db) => _db = db;

    [HttpPost("add")]
    public async Task<IActionResult> AddPlayer([FromBody] Player player)
    {
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return Ok(player);
    }

    [HttpGet("all")]
    public IActionResult GetPlayers() => Ok(_db.Players.ToList());
}
