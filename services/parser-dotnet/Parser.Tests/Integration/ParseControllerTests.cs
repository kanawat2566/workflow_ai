using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Parser.API.Models;

namespace Parser.Tests.Integration;

public class ParseControllerTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetHealth_ReturnsOkWithStatusOk()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("ok", body);
    }

    [Fact]
    public async Task ParseFile_WithNonExistentPath_ReturnsBadRequest()
    {
        // Arrange
        var request = new { filePath = "/nonexistent/path/File.cs" };

        // Act
        var response = await _client.PostAsJsonAsync("/parse/file", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ParseFile_WithValidController_Returns200WithChunks()
    {
        // Arrange
        var tempFile = Path.Combine(Path.GetTempPath(), $"Test_{Guid.NewGuid()}.cs");
        await File.WriteAllTextAsync(tempFile, """
            public class ProductController : Controller
            {
                [HttpGet]
                public IActionResult List() => View();
            }
            """);

        try
        {
            var request = new { filePath = tempFile };

            // Act
            var response = await _client.PostAsJsonAsync("/parse/file", request);
            var body = await response.Content.ReadFromJsonAsync<ParseFileResponse>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(body);
            Assert.NotEmpty(body.Chunks);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Fact]
    public async Task ParseRepo_WithValidDirectory_ReturnsRouteMap()
    {
        // Arrange
        var tempDir = Path.Combine(Path.GetTempPath(), $"Repo_{Guid.NewGuid()}");
        Directory.CreateDirectory(tempDir);
        await File.WriteAllTextAsync(Path.Combine(tempDir, "OrderController.cs"), """
            public class OrderController : Controller
            {
                [HttpGet]
                public IActionResult Index() => View();
                [HttpPost]
                public IActionResult Create(OrderViewModel model) => View();
            }
            """);

        try
        {
            var request = new { repoPath = tempDir };

            // Act
            var response = await _client.PostAsJsonAsync("/parse/repo", request);
            var body = await response.Content.ReadFromJsonAsync<ParseRepoResponse>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(body);
            Assert.NotEmpty(body.RouteMap);
        }
        finally
        {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task GetRoutes_WithValidDirectory_ReturnsRoutes()
    {
        // Arrange
        var tempDir = Path.Combine(Path.GetTempPath(), $"Routes_{Guid.NewGuid()}");
        Directory.CreateDirectory(tempDir);
        await File.WriteAllTextAsync(Path.Combine(tempDir, "InvoiceController.cs"), """
            public class InvoiceController : Controller
            {
                [HttpGet]
                public IActionResult Index() => View();
            }
            """);

        try
        {
            // Act
            var response = await _client.GetAsync($"/parse/routes?repoPath={Uri.EscapeDataString(tempDir)}");
            var body = await response.Content.ReadFromJsonAsync<ParseRoutesResponse>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(body);
            Assert.NotEmpty(body.Routes);
        }
        finally
        {
            Directory.Delete(tempDir, recursive: true);
        }
    }

    [Fact]
    public async Task ParseIncremental_WithChangedFiles_ReturnsUpdatedChunks()
    {
        // Arrange
        var tempFile = Path.Combine(Path.GetTempPath(), $"Inc_{Guid.NewGuid()}.cs");
        await File.WriteAllTextAsync(tempFile, """
            public class ReportController : Controller
            {
                [HttpGet]
                public IActionResult Summary() => View();
            }
            """);

        try
        {
            var request = new { changedFiles = new[] { tempFile } };

            // Act
            var response = await _client.PostAsJsonAsync("/parse/incremental", request);
            var body = await response.Content.ReadFromJsonAsync<ParseIncrementalResponse>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(body);
            Assert.NotEmpty(body.UpdatedChunks);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }
}
