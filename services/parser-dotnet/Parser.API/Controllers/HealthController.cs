using Microsoft.AspNetCore.Mvc;

namespace Parser.API.Controllers;

[ApiController]
public sealed class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult GetHealth() => Ok(new { status = "ok" });
}
