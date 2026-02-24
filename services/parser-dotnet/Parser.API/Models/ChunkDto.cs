namespace Parser.API.Models;

/// <summary>
/// Output chunk จาก parser — ตาม chunk_schema.json
/// chunkId format: {ControllerName}.{ActionName}.{HttpMethod}
/// </summary>
public sealed record ChunkDto
{
    public required string ChunkId { get; init; }
    public required string File { get; init; }
    public required ChunkType Type { get; init; }
    public required string Content { get; init; }
    public required ChunkMetadata Metadata { get; init; }
}

public enum ChunkType
{
    action_method,
    viewmodel,
    service_method,
    repository_method,
    razor_view,
    razor_partial,
    js_function,
    js_event_handler,
    js_ajax_call,
    ef_model,
    @interface,
    config,
}

public sealed record ChunkMetadata
{
    public string? Controller { get; init; }
    public string? Action { get; init; }
    public string? HttpMethod { get; init; }
    public string? Route { get; init; }
    public string? Namespace { get; init; }
    public string? ClassName { get; init; }
    public string? MethodName { get; init; }
    public List<ParameterInfo> Parameters { get; init; } = [];
    public ViewModelInfo? ViewModel { get; init; }
    public List<string> Calls { get; init; } = [];
    public List<string> CalledBy { get; init; } = [];
    public List<string> DbTables { get; init; } = [];
    public string? ViewPath { get; init; }
    public List<string> PartialsUsed { get; init; } = [];
    public List<string> AjaxEndpoints { get; init; } = [];
    public List<string> EventHandlers { get; init; } = [];
    public List<string> Validations { get; init; } = [];
    public string? Module { get; init; }
    public string? Language { get; init; }
    public int? LineStart { get; init; }
    public int? LineEnd { get; init; }
}

public sealed record ParameterInfo
{
    public required string Name { get; init; }
    public required string Type { get; init; }
    public string Source { get; init; } = "unknown";
}

public sealed record ViewModelInfo
{
    public required string Name { get; init; }
    public List<string> Properties { get; init; } = [];
}
