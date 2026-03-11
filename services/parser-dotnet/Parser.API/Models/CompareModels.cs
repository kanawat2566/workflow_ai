namespace Parser.API.Models;

public sealed record ParseCompareRequest
{
    public required string RepoPath { get; init; }
    public required string BaseRef { get; init; }
    public required string HeadRef { get; init; }
    public List<string>? Modules { get; init; }
}

public sealed record ModifiedChunkPair
{
    public required ChunkDto Before { get; init; }
    public required ChunkDto After { get; init; }
}

public sealed record ParseCompareResponse
{
    public required List<ChunkDto> AddedChunks { get; init; }
    public required List<ModifiedChunkPair> ModifiedChunks { get; init; }
    public required List<ChunkDto> DeletedChunks { get; init; }
    public int UnchangedCount { get; init; }
    public required CompareStats Stats { get; init; }
}

public sealed record CompareStats
{
    public int Added { get; init; }
    public int Modified { get; init; }
    public int Deleted { get; init; }
    public int Unchanged { get; init; }
}
