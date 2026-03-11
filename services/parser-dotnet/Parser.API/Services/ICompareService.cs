namespace Parser.API.Services;

using Parser.API.Models;

public interface ICompareService
{
    Task<ParseCompareResponse> CompareAsync(
        string repoPath,
        string baseRef,
        string headRef,
        IEnumerable<string>? modules,
        CancellationToken ct);
}
