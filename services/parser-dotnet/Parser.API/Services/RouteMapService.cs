using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Logging;
using Parser.API.Models;

namespace Parser.API.Services;

public sealed class RouteMapService(ILogger<RouteMapService> logger) : IRouteMapService
{
    public async Task<List<RouteEntry>> ExtractRoutesAsync(string repoPath, CancellationToken ct = default)
    {
        var routes = new List<RouteEntry>();
        var csFiles = Directory.GetFiles(repoPath, "*.cs", SearchOption.AllDirectories)
            .Where(f => f.Contains("Controller", StringComparison.OrdinalIgnoreCase));

        foreach (var file in csFiles)
        {
            ct.ThrowIfCancellationRequested();
            var source = await File.ReadAllTextAsync(file, ct);
            var fileRoutes = ExtractFromSource(source, repoPath);
            routes.AddRange(fileRoutes);
        }

        logger.LogInformation("ExtractRoutes: {Count} routes found", routes.Count);
        return routes;
    }

    private static List<RouteEntry> ExtractFromSource(string source, string repoPath)
    {
        var entries = new List<RouteEntry>();
        var tree = CSharpSyntaxTree.ParseText(source);
        var root = tree.GetCompilationUnitRoot();

        var controllers = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(c =>
                c.Identifier.Text.EndsWith("Controller", StringComparison.Ordinal) ||
                c.BaseList?.Types.Any(t => t.ToString().Contains("Controller")) == true);

        foreach (var controller in controllers)
        {
            var controllerName = controller.Identifier.Text.Replace("Controller", "");
            var areaPrefix = ExtractAreaPrefix(controller);

            var actions = controller.Members
                .OfType<MethodDeclarationSyntax>()
                .Where(m => m.Modifiers.Any(mod => mod.ValueText == "public"));

            foreach (var action in actions)
            {
                var httpMethod = ExtractHttpMethod(action);
                var route = BuildRoute(action, controllerName, areaPrefix);
                var viewModel = ExtractViewModelName(action);

                entries.Add(new RouteEntry
                {
                    Route = route,
                    Controller = controller.Identifier.Text,
                    Action = action.Identifier.Text,
                    HttpMethod = httpMethod,
                    ViewPath = BuildViewPath(controllerName, action.Identifier.Text),
                    ViewModel = viewModel,
                });
            }
        }

        return entries;
    }

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

    private static string BuildRoute(MethodDeclarationSyntax method, string controllerName, string? areaPrefix)
    {
        var routeAttr = method.AttributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString() is "Route");

        string route;
        if (routeAttr?.ArgumentList?.Arguments.FirstOrDefault()?.Expression is LiteralExpressionSyntax lit)
            route = lit.Token.ValueText;
        else
            route = $"/{controllerName}/{method.Identifier.Text}";

        return areaPrefix is not null ? $"/{areaPrefix}{route}" : route;
    }

    private static string? ExtractAreaPrefix(ClassDeclarationSyntax cls)
    {
        var areaAttr = cls.AttributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString() is "Area");

        if (areaAttr?.ArgumentList?.Arguments.FirstOrDefault()?.Expression is LiteralExpressionSyntax lit)
            return lit.Token.ValueText;

        return null;
    }

    private static string BuildViewPath(string controllerName, string actionName) =>
        $"Views/{controllerName}/{actionName}.cshtml";

    private static string? ExtractViewModelName(MethodDeclarationSyntax method)
    {
        var param = method.ParameterList.Parameters
            .FirstOrDefault(p => p.Type?.ToString().EndsWith("ViewModel", StringComparison.Ordinal) == true
                              || p.Type?.ToString().EndsWith("Model", StringComparison.Ordinal) == true);

        return param?.Type?.ToString();
    }
}
