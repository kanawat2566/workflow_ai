namespace Parser.API.Models;

public sealed record ParseRepoResponse
{
    public required List<ChunkDto> Chunks { get; init; }
    public required List<RouteEntry> RouteMap { get; init; }
    public required ParseStats Stats { get; init; }
}

public sealed record ParseFileResponse
{
    public required List<ChunkDto> Chunks { get; init; }
}

public sealed record ParseRoutesResponse
{
    public required List<RouteEntry> Routes { get; init; }
}

public sealed record ParseIncrementalResponse
{
    public required List<ChunkDto> UpdatedChunks { get; init; }
}

public sealed record ParseStats
{
    public int TotalFiles { get; init; }
    public int TotalChunks { get; init; }
    public int ControllerCount { get; init; }
    public int ViewCount { get; init; }
    public int JsFileCount { get; init; }
    public long ParsedAtUtc { get; init; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
}
