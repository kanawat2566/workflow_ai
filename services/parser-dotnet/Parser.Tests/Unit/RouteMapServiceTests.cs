using Microsoft.Extensions.Logging.Abstractions;
using Parser.API.Services;

namespace Parser.Tests.Unit;

public class RouteMapServiceTests : IDisposable
{
    private readonly string _tempDir =
        Path.Combine(Path.GetTempPath(), $"RouteMapTests_{Guid.NewGuid()}");

    public RouteMapServiceTests() => Directory.CreateDirectory(_tempDir);

    public void Dispose() => Directory.Delete(_tempDir, recursive: true);

    [Fact]
    public async Task ExtractRoutesAsync_WithAreaAttribute_IncludesAreaInRoute()
    {
        // Arrange
        await WriteControllerAsync("UserController.cs", """
            [Area("Admin")]
            public class UserController : Controller
            {
                [HttpGet]
                public IActionResult Index() => View();
            }
            """);

        // Act
        var routes = await CreateService().ExtractRoutesAsync(_tempDir);

        // Assert
        Assert.Single(routes);
        Assert.Contains("Admin", routes[0].Route);
    }

    [Fact]
    public async Task ExtractRoutesAsync_WithNoController_ReturnsEmpty()
    {
        // Arrange
        await WriteControllerAsync("StringHelper.cs", """
            public static class StringHelper
            {
                public static string Trim(string value) => value.Trim();
            }
            """);

        // Act
        var routes = await CreateService().ExtractRoutesAsync(_tempDir);

        // Assert
        Assert.Empty(routes);
    }

    private RouteMapService CreateService() =>
        new(NullLogger<RouteMapService>.Instance);

    private Task WriteControllerAsync(string fileName, string content) =>
        File.WriteAllTextAsync(Path.Combine(_tempDir, fileName), content);
}
