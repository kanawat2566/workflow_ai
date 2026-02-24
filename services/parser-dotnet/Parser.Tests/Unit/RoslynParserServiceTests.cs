using Microsoft.Extensions.Logging.Abstractions;
using Parser.API.Models;
using Parser.API.Services;

namespace Parser.Tests.Unit;

public class RoslynParserServiceTests
{
    private static RoslynParserService CreateService() =>
        new(NullLogger<RoslynParserService>.Instance);

    [Fact]
    public async Task ParseSourceAsync_WithHttpPostAction_ReturnsCorrectChunkId()
    {
        // Arrange
        const string code = """
            public class PaymentController : Controller
            {
                [HttpPost]
                public IActionResult Save(PaymentViewModel model) => View();
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "PaymentController.cs");

        // Assert
        Assert.Single(chunks);
        Assert.Equal("PaymentController.Save.POST", chunks[0].ChunkId);
    }

    [Fact]
    public async Task ParseSourceAsync_WithEmptyFile_ReturnsEmptyList()
    {
        // Act
        var chunks = await CreateService().ParseSourceAsync("", "Empty.cs");

        // Assert
        Assert.Empty(chunks);
    }

    [Theory]
    [InlineData("[HttpGet]", "GET")]
    [InlineData("[HttpPost]", "POST")]
    [InlineData("[HttpPut]", "PUT")]
    [InlineData("[HttpDelete]", "DELETE")]
    public async Task ParseSourceAsync_WithDifferentHttpMethods_ExtractsCorrectMethod(
        string attribute, string expectedMethod)
    {
        // Arrange
        var code = $$"""
            public class OrderController : Controller
            {
                {{attribute}}
                public IActionResult Index() => View();
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "OrderController.cs");

        // Assert
        Assert.Single(chunks);
        Assert.Equal(expectedMethod, chunks[0].Metadata.HttpMethod);
    }

    [Fact]
    public async Task ParseSourceAsync_WithViewModel_ExtractsProperties()
    {
        // Arrange
        const string code = """
            public class PaymentViewModel
            {
                public string CardNumber { get; set; }
                public decimal Amount { get; set; }
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "PaymentViewModel.cs");

        // Assert
        Assert.Single(chunks);
        Assert.Equal(ChunkType.viewmodel, chunks[0].Type);
        Assert.Contains("CardNumber", chunks[0].Metadata.ViewModel!.Properties);
        Assert.Contains("Amount", chunks[0].Metadata.ViewModel!.Properties);
    }
}
