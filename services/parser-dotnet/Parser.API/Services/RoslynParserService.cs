using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Logging;
using Parser.API.Models;

namespace Parser.API.Services;

public sealed class RoslynParserService(ILogger<RoslynParserService> logger) : IRoslynParserService
{
    private static readonly string[] CsharpExtensions = [".cs"];
    private static readonly string[] RazorExtensions = [".cshtml"];
    private static readonly string[] JsExtensions = [".js"];

    public async Task<List<ChunkDto>> ParseRepoAsync(
        string repoPath,
        IEnumerable<string>? modules,
        CancellationToken ct = default)
    {
        var allChunks = new List<ChunkDto>();
        var files = Directory.GetFiles(repoPath, "*.*", SearchOption.AllDirectories)
            .Where(f => IsParseableFile(f))
            .ToList();

        foreach (var file in files)
        {
            ct.ThrowIfCancellationRequested();
            var chunks = await ParseFileAsync(file, ct);
            allChunks.AddRange(chunks);
        }

        logger.LogInformation("ParseRepo: {Count} chunks from {FileCount} files", allChunks.Count, files.Count);
        return allChunks;
    }

    public async Task<List<ChunkDto>> ParseFileAsync(string filePath, CancellationToken ct = default)
    {
        var source = await File.ReadAllTextAsync(filePath, ct);
        return await ParseSourceAsync(source, Path.GetFileName(filePath), ct);
    }

    public Task<List<ChunkDto>> ParseSourceAsync(string sourceCode, string fileName, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var chunks = ext switch
        {
            ".cs" => ParseCsharp(sourceCode, fileName),
            ".cshtml" => ParseRazor(sourceCode, fileName),
            ".js" => ParseJavaScript(sourceCode, fileName),
            _ => [],
        };
        return Task.FromResult(chunks);
    }

    private List<ChunkDto> ParseCsharp(string source, string fileName)
    {
        var tree = CSharpSyntaxTree.ParseText(source);
        var root = tree.GetCompilationUnitRoot();
        var chunks = new List<ChunkDto>();

        chunks.AddRange(ParseControllers(root, fileName, source));
        chunks.AddRange(ParseViewModels(root, fileName, source));
        chunks.AddRange(ParseEfModels(root, fileName, source));

        return chunks;
    }

    private List<ChunkDto> ParseControllers(CompilationUnitSyntax root, string fileName, string source)
    {
        var chunks = new List<ChunkDto>();
        var controllers = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(IsControllerClass);

        foreach (var controller in controllers)
        {
            var controllerName = controller.Identifier.Text;
            var ns = GetNamespace(controller);
            var actions = controller.Members
                .OfType<MethodDeclarationSyntax>()
                .Where(IsPublicMethod);

            foreach (var action in actions)
            {
                var httpMethod = ExtractHttpMethod(action);
                var route = ExtractRoute(action, controllerName);
                var lineStart = action.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
                var lineEnd = action.GetLocation().GetLineSpan().EndLinePosition.Line + 1;

                chunks.Add(new ChunkDto
                {
                    ChunkId = $"{controllerName}.{action.Identifier.Text}.{httpMethod}",
                    File = fileName,
                    Type = ChunkType.action_method,
                    Content = action.ToFullString().Trim(),
                    Metadata = new ChunkMetadata
                    {
                        Controller = controllerName,
                        Action = action.Identifier.Text,
                        HttpMethod = httpMethod,
                        Route = route,
                        Namespace = ns,
                        Parameters = ExtractParameters(action),
                        Calls = ExtractMethodCalls(action),
                        Language = "csharp",
                        LineStart = lineStart,
                        LineEnd = lineEnd,
                    },
                });
            }
        }

        return chunks;
    }

    private List<ChunkDto> ParseViewModels(CompilationUnitSyntax root, string fileName, string source)
    {
        var chunks = new List<ChunkDto>();
        var viewModelClasses = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(c => !IsControllerClass(c) && !IsEfDbContext(c));

        foreach (var vmClass in viewModelClasses)
        {
            var ns = GetNamespace(vmClass);
            var properties = vmClass.Members
                .OfType<PropertyDeclarationSyntax>()
                .Select(p => p.Identifier.Text)
                .ToList();

            var validations = ExtractValidationAnnotations(vmClass);
            var lineStart = vmClass.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
            var lineEnd = vmClass.GetLocation().GetLineSpan().EndLinePosition.Line + 1;

            chunks.Add(new ChunkDto
            {
                ChunkId = $"{vmClass.Identifier.Text}.ViewModel",
                File = fileName,
                Type = ChunkType.viewmodel,
                Content = vmClass.ToFullString().Trim(),
                Metadata = new ChunkMetadata
                {
                    ClassName = vmClass.Identifier.Text,
                    Namespace = ns,
                    ViewModel = new ViewModelInfo
                    {
                        Name = vmClass.Identifier.Text,
                        Properties = properties,
                    },
                    Validations = validations,
                    Language = "csharp",
                    LineStart = lineStart,
                    LineEnd = lineEnd,
                },
            });
        }

        return chunks;
    }

    private List<ChunkDto> ParseEfModels(CompilationUnitSyntax root, string fileName, string source)
    {
        var chunks = new List<ChunkDto>();
        var dbContextClasses = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(IsEfDbContext);

        foreach (var dbCtx in dbContextClasses)
        {
            var dbTables = dbCtx.Members
                .OfType<PropertyDeclarationSyntax>()
                .Where(p => p.Type.ToString().StartsWith("DbSet", StringComparison.Ordinal))
                .Select(p => p.Identifier.Text)
                .ToList();

            chunks.Add(new ChunkDto
            {
                ChunkId = $"{dbCtx.Identifier.Text}.DbContext",
                File = fileName,
                Type = ChunkType.ef_model,
                Content = dbCtx.ToFullString().Trim(),
                Metadata = new ChunkMetadata
                {
                    ClassName = dbCtx.Identifier.Text,
                    DbTables = dbTables,
                    Language = "csharp",
                },
            });
        }

        return chunks;
    }

    private List<ChunkDto> ParseRazor(string source, string fileName)
    {
        var chunks = new List<ChunkDto>();
        var viewName = Path.GetFileNameWithoutExtension(fileName);

        var modelMatch = Regex.Match(source, @"@model\s+([\w\.]+)");
        var formMatches = Regex.Matches(source, @"Html\.BeginForm\s*\(\s*""(\w+)""\s*,\s*""(\w+)""(?:\s*,\s*FormMethod\.(\w+))?");
        var partialMatches = Regex.Matches(source, @"Html\.(Partial|RenderPartial)\s*\(\s*""([^""]+)""");
        var scriptMatches = Regex.Matches(source, @"@section\s+Scripts\s*\{[^}]*<script[^>]*src=[""']([^""']+)[""']");

        var partialsUsed = partialMatches.Cast<Match>()
            .Select(m => m.Groups[2].Value)
            .ToList();

        chunks.Add(new ChunkDto
        {
            ChunkId = $"View.{viewName}",
            File = fileName,
            Type = ChunkType.razor_view,
            Content = source,
            Metadata = new ChunkMetadata
            {
                ViewModel = modelMatch.Success ? new ViewModelInfo { Name = modelMatch.Groups[1].Value } : null,
                PartialsUsed = partialsUsed,
                Language = "razor",
            },
        });

        return chunks;
    }

    private List<ChunkDto> ParseJavaScript(string source, string fileName)
    {
        var chunks = new List<ChunkDto>();
        var baseName = Path.GetFileNameWithoutExtension(fileName);

        var funcMatches = Regex.Matches(source, @"(?:function\s+(\w+)|(?:var|let|const)\s+(\w+)\s*=\s*function)\s*\(([^)]*)\)\s*\{");
        var ajaxMatches = Regex.Matches(source, @"\$\.ajax\s*\(\s*\{[^}]*url\s*:\s*[""']([^""']+)[""'][^}]*(?:type|method)\s*:\s*[""'](\w+)[""']", RegexOptions.Singleline);
        var eventMatches = Regex.Matches(source, @"\$\([""']([^""']+)[""']\)\.on\s*\(\s*[""'](\w+)[""']");

        foreach (Match func in funcMatches)
        {
            var funcName = func.Groups[1].Success ? func.Groups[1].Value : func.Groups[2].Value;
            chunks.Add(new ChunkDto
            {
                ChunkId = $"JS.{baseName}.{funcName}",
                File = fileName,
                Type = ChunkType.js_function,
                Content = ExtractJsFunction(source, func.Index),
                Metadata = new ChunkMetadata { Language = "javascript" },
            });
        }

        foreach (Match ajax in ajaxMatches)
        {
            chunks.Add(new ChunkDto
            {
                ChunkId = $"JS.{baseName}.ajax.{SanitizeId(ajax.Groups[1].Value)}",
                File = fileName,
                Type = ChunkType.js_ajax_call,
                Content = ajax.Value,
                Metadata = new ChunkMetadata
                {
                    AjaxEndpoints = [ajax.Groups[1].Value],
                    HttpMethod = ajax.Groups[2].Value.ToUpperInvariant(),
                    Language = "javascript",
                },
            });
        }

        foreach (Match ev in eventMatches)
        {
            chunks.Add(new ChunkDto
            {
                ChunkId = $"JS.{baseName}.event.{SanitizeId(ev.Groups[1].Value)}.{ev.Groups[2].Value}",
                File = fileName,
                Type = ChunkType.js_event_handler,
                Content = ev.Value,
                Metadata = new ChunkMetadata
                {
                    EventHandlers = [$"{ev.Groups[1].Value} {ev.Groups[2].Value}"],
                    Language = "javascript",
                },
            });
        }

        return chunks;
    }

    private static bool IsControllerClass(ClassDeclarationSyntax c) =>
        c.Identifier.Text.EndsWith("Controller", StringComparison.Ordinal) ||
        c.BaseList?.Types.Any(t => t.ToString().Contains("Controller")) == true;

    private static bool IsEfDbContext(ClassDeclarationSyntax c) =>
        c.BaseList?.Types.Any(t => t.ToString().Contains("DbContext")) == true;

    private static bool IsPublicMethod(MethodDeclarationSyntax m) =>
        m.Modifiers.Any(mod => mod.IsKind(SyntaxKind.PublicKeyword));

    private static string ExtractHttpMethod(MethodDeclarationSyntax method)
    {
        var attrs = method.AttributeLists.SelectMany(al => al.Attributes);
        foreach (var attr in attrs)
        {
            var name = attr.Name.ToString();
            if (name is "HttpGet") return "GET";
            if (name is "HttpPost") return "POST";
            if (name is "HttpPut") return "PUT";
            if (name is "HttpDelete") return "DELETE";
            if (name is "HttpPatch") return "PATCH";
        }

        return "GET";
    }

    private static string ExtractRoute(MethodDeclarationSyntax method, string controllerName)
    {
        var routeAttr = method.AttributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString() is "Route");

        if (routeAttr?.ArgumentList?.Arguments.FirstOrDefault()?.Expression is LiteralExpressionSyntax lit)
            return lit.Token.ValueText;

        return $"/{controllerName.Replace("Controller", "")}/{method.Identifier.Text}";
    }

    private static List<ParameterInfo> ExtractParameters(MethodDeclarationSyntax method) =>
        method.ParameterList.Parameters
            .Select(p => new ParameterInfo
            {
                Name = p.Identifier.Text,
                Type = p.Type?.ToString() ?? "object",
                Source = InferParameterSource(p),
            })
            .ToList();

    private static string InferParameterSource(ParameterSyntax p)
    {
        var attrs = p.AttributeLists.SelectMany(al => al.Attributes).Select(a => a.Name.ToString()).ToList();
        if (attrs.Contains("FromBody")) return "body";
        if (attrs.Contains("FromQuery")) return "query";
        if (attrs.Contains("FromRoute")) return "route";
        if (attrs.Contains("FromForm")) return "form";
        return "unknown";
    }

    private static List<string> ExtractMethodCalls(MethodDeclarationSyntax method) =>
        method.DescendantNodes()
            .OfType<InvocationExpressionSyntax>()
            .Select(i => i.Expression.ToString())
            .Distinct()
            .ToList();

    private static List<string> ExtractValidationAnnotations(ClassDeclarationSyntax cls) =>
        cls.Members
            .OfType<PropertyDeclarationSyntax>()
            .SelectMany(p => p.AttributeLists.SelectMany(al => al.Attributes))
            .Select(a => a.Name.ToString())
            .Where(name => name is "Required" or "Range" or "StringLength" or "MaxLength" or "MinLength" or "RegularExpression" or "EmailAddress")
            .Distinct()
            .ToList();

    private static string? GetNamespace(SyntaxNode node)
    {
        var ns = node.Ancestors().OfType<NamespaceDeclarationSyntax>().FirstOrDefault()?.Name.ToString();
        if (ns is not null) return ns;
        return node.Ancestors().OfType<FileScopedNamespaceDeclarationSyntax>().FirstOrDefault()?.Name.ToString();
    }

    private static bool IsParseableFile(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext is ".cs" or ".cshtml" or ".js";
    }

    private static string ExtractJsFunction(string source, int startIndex)
    {
        var depth = 0;
        var started = false;
        for (var i = startIndex; i < source.Length; i++)
        {
            if (source[i] == '{') { depth++; started = true; }
            else if (source[i] == '}') { depth--; }
            if (started && depth == 0)
                return source[startIndex..(i + 1)];
        }

        return source[startIndex..Math.Min(startIndex + 500, source.Length)];
    }

    private static string SanitizeId(string value) =>
        Regex.Replace(value, @"[^a-zA-Z0-9_]", "_");
}
