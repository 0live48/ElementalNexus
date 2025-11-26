using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Connect to your local SQL Server
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseSqlServer("Server=PRASHAB\\SQLEXPRESS;Database=ElementalNexusDB;Trusted_Connection=True;"));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors();
app.MapControllers();
app.Run();

public class GameDbContext : DbContext
{
    public GameDbContext(DbContextOptions<GameDbContext> options) : base(options) { }
    public DbSet<Player> Players => Set<Player>();
}

public class Player
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
}
