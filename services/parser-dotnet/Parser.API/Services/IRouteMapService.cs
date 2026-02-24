using Parser.API.Models;

namespace Parser.API.Services;

public interface IRouteMapService
{
    /// <summary>
    /// Extract route map จากทุก Controller ใน repo
    /// </summary>
    Task<List<RouteEntry>> ExtractRoutesAsync(string repoPath, CancellationToken ct = default);
}
