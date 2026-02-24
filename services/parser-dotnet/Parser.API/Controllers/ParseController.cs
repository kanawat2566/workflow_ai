using Microsoft.AspNetCore.Mvc;
using Parser.API.Models;
using Parser.API.Services;

namespace Parser.API.Controllers;

[ApiController]
[Route("parse")]
public sealed class ParseController(
    IRoslynParserService parser,
    IRouteMapService routeMap,
    ILogger<ParseController> logger) : ControllerBase
{
    [HttpPost("repo")]
    public async Task<ActionResult<ParseRepoResponse>> ParseRepo(
        [FromBody] ParseRepoRequest request,
        CancellationToken ct)
    {
        logger.LogInformation("ParseRepo: {RepoPath}", request.RepoPath);

        if (!Directory.Exists(request.RepoPath))
            return BadRequest(new { error = $"RepoPath not found: {request.RepoPath}" });

        var chunks = await parser.ParseRepoAsync(request.RepoPath, request.Modules, ct);
        var routes = await routeMap.ExtractRoutesAsync(request.RepoPath, ct);

        var stats = new ParseStats
        {
            TotalFiles = chunks.Select(c => c.File).Distinct().Count(),
            TotalChunks = chunks.Count,
            ControllerCount = chunks.Count(c => c.Type == ChunkType.action_method),
            ViewCount = chunks.Count(c => c.Type == ChunkType.razor_view),
            JsFileCount = chunks.Count(c => c.Type is ChunkType.js_function or ChunkType.js_ajax_call or ChunkType.js_event_handler),
        };

        return Ok(new ParseRepoResponse { Chunks = chunks, RouteMap = routes, Stats = stats });
    }

    [HttpPost("file")]
    public async Task<ActionResult<ParseFileResponse>> ParseFile(
        [FromBody] ParseFileRequest request,
        CancellationToken ct)
    {
        logger.LogInformation("ParseFile: {FilePath}", request.FilePath);

        if (!System.IO.File.Exists(request.FilePath))
            return BadRequest(new { error = $"File not found: {request.FilePath}" });

        var chunks = await parser.ParseFileAsync(request.FilePath, ct);
        return Ok(new ParseFileResponse { Chunks = chunks });
    }

    [HttpGet("routes")]
    public async Task<ActionResult<ParseRoutesResponse>> GetRoutes(
        [FromQuery] string repoPath,
        CancellationToken ct)
    {
        logger.LogInformation("GetRoutes: {RepoPath}", repoPath);

        if (!Directory.Exists(repoPath))
            return BadRequest(new { error = $"RepoPath not found: {repoPath}" });

        var routes = await routeMap.ExtractRoutesAsync(repoPath, ct);
        return Ok(new ParseRoutesResponse { Routes = routes });
    }

    [HttpPost("incremental")]
    public async Task<ActionResult<ParseIncrementalResponse>> ParseIncremental(
        [FromBody] ParseIncrementalRequest request,
        CancellationToken ct)
    {
        logger.LogInformation("ParseIncremental: {Count} files", request.ChangedFiles.Count);

        var updatedChunks = new List<ChunkDto>();
        foreach (var filePath in request.ChangedFiles)
        {
            ct.ThrowIfCancellationRequested();

            if (!System.IO.File.Exists(filePath))
            {
                logger.LogWarning("Incremental: file not found {FilePath}", filePath);
                continue;
            }

            var chunks = await parser.ParseFileAsync(filePath, ct);
            updatedChunks.AddRange(chunks);
        }

        return Ok(new ParseIncrementalResponse { UpdatedChunks = updatedChunks });
    }
}
