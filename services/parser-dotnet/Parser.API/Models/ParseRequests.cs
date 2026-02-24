namespace Parser.API.Models;

public sealed record ParseRepoRequest
{
    public required string RepoPath { get; init; }
    public string? Branch { get; init; }
    public List<string>? Modules { get; init; }
}

public sealed record ParseFileRequest
{
    public required string FilePath { get; init; }
}

public sealed record ParseIncrementalRequest
{
    public required List<string> ChangedFiles { get; init; }
}
