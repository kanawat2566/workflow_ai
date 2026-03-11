using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Parser.API.Models;

namespace Parser.API.Services;

public sealed class CompareService(
    IRoslynParserService parser,
    ILogger<CompareService> logger) : ICompareService
{
    public async Task<ParseCompareResponse> CompareAsync(
        string repoPath,
        string baseRef,
        string headRef,
        IEnumerable<string>? modules,
        CancellationToken ct)
    {
        var changedFiles = await GetChangedFilesAsync(repoPath, baseRef, headRef, ct);
        logger.LogInformation("Compare {Base}..{Head}: {Count} changed files", baseRef, headRef, changedFiles.Count);

        var baseChunks = await ParseRefChunksAsync(repoPath, baseRef, changedFiles, ct);
        var headChunks = await ParseRefChunksAsync(repoPath, headRef, changedFiles, ct);

        return BuildDiff(baseChunks, headChunks);
    }

    private async Task<List<string>> GetChangedFilesAsync(
        string repoPath, string baseRef, string headRef, CancellationToken ct)
    {
        var output = await RunGitAsync(repoPath, $"diff --name-only {baseRef} {headRef}", ct);
        return output
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Where(f => f.EndsWith(".cs", StringComparison.OrdinalIgnoreCase)
                     || f.EndsWith(".cshtml", StringComparison.OrdinalIgnoreCase)
                     || f.EndsWith(".js", StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private async Task<Dictionary<string, ChunkDto>> ParseRefChunksAsync(
        string repoPath, string gitRef, List<string> files, CancellationToken ct)
    {
        var result = new Dictionary<string, ChunkDto>();

        foreach (var relPath in files)
        {
            ct.ThrowIfCancellationRequested();
            var content = await RunGitAsync(repoPath, $"show {gitRef}:{relPath}", ct);
            if (string.IsNullOrEmpty(content)) continue;

            var fileName = Path.GetFileName(relPath);
            var chunks = await parser.ParseSourceAsync(content, fileName, ct);

            foreach (var chunk in chunks)
                result[chunk.ChunkId] = chunk;
        }

        return result;
    }

    internal static ParseCompareResponse BuildDiff(
        Dictionary<string, ChunkDto> baseChunks,
        Dictionary<string, ChunkDto> headChunks)
    {
        var added = new List<ChunkDto>();
        var modified = new List<ModifiedChunkPair>();
        var deleted = new List<ChunkDto>();
        var unchanged = 0;

        foreach (var (id, headChunk) in headChunks)
        {
            if (!baseChunks.TryGetValue(id, out var baseChunk))
                added.Add(headChunk);
            else if (headChunk.Content != baseChunk.Content)
                modified.Add(new ModifiedChunkPair { Before = baseChunk, After = headChunk });
            else
                unchanged++;
        }

        foreach (var (id, baseChunk) in baseChunks)
        {
            if (!headChunks.ContainsKey(id))
                deleted.Add(baseChunk);
        }

        return new ParseCompareResponse
        {
            AddedChunks = added,
            ModifiedChunks = modified,
            DeletedChunks = deleted,
            UnchangedCount = unchanged,
            Stats = new CompareStats
            {
                Added = added.Count,
                Modified = modified.Count,
                Deleted = deleted.Count,
                Unchanged = unchanged,
            },
        };
    }

    private async Task<string> RunGitAsync(string workDir, string arguments, CancellationToken ct)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = arguments,
                WorkingDirectory = workDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            },
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync(ct);
        var error = await process.StandardError.ReadToEndAsync(ct);
        await process.WaitForExitAsync(ct);

        if (process.ExitCode != 0)
            logger.LogWarning("git {Args} exited with code {Code}: {Error}", arguments, process.ExitCode, error);

        return output;
    }
}
