namespace Parser.API.Models;

/// <summary>
/// MVC route entry — map Controller → Action → View
/// </summary>
public sealed record RouteEntry
{
    public required string Route { get; init; }
    public required string Controller { get; init; }
    public required string Action { get; init; }
    public required string HttpMethod { get; init; }
    public string? ViewPath { get; init; }
    public string? ViewModel { get; init; }
}
