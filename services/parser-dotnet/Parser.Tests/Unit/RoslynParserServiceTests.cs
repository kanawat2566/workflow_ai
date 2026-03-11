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

    [Fact]
    public async Task ParseSourceAsync_WithRazorView_ReturnsRazorChunk()
    {
        // Arrange
        const string razor = """
            @model PaymentViewModel
            @Html.BeginForm("Save", "Payment", FormMethod.Post)
            @Html.Partial("_Summary")
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(razor, "Save.cshtml");

        // Assert
        Assert.Single(chunks);
        Assert.Equal(ChunkType.razor_view, chunks[0].Type);
        Assert.Equal("PaymentViewModel", chunks[0].Metadata.ViewModel!.Name);
        Assert.Contains("_Summary", chunks[0].Metadata.PartialsUsed);
    }

    [Fact]
    public async Task ParseSourceAsync_WithJavaScript_ReturnsJsChunks()
    {
        // Arrange
        const string js = """
            function submitForm() {
                $.ajax({ url: '/Payment/Save', type: 'POST' });
            }
            $('#btn').on('click', function() {});
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(js, "payment.js");

        // Assert
        Assert.NotEmpty(chunks);
        Assert.Contains(chunks, c => c.Type == ChunkType.js_function);
        Assert.Contains(chunks, c => c.Type == ChunkType.js_ajax_call);
        Assert.Contains(chunks, c => c.Type == ChunkType.js_event_handler);
    }

    [Fact]
    public async Task ParseSourceAsync_WithUnknownExtension_ReturnsEmptyList()
    {
        // Act
        var chunks = await CreateService().ParseSourceAsync("some content", "file.txt");

        // Assert
        Assert.Empty(chunks);
    }

    [Fact]
    public async Task ParseSourceAsync_WithServiceClass_ReturnsServiceMethodChunks()
    {
        // Arrange
        const string code = """
            public interface IPaymentService
            {
                void Process(int id);
            }

            public class PaymentService : IPaymentService
            {
                public void Process(int id) { }
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "PaymentService.cs");

        // Assert
        var serviceChunks = chunks.Where(c => c.Type == ChunkType.service_method).ToList();
        Assert.NotEmpty(serviceChunks);
        Assert.Equal("PaymentService.Process", serviceChunks[0].ChunkId);
        Assert.Equal("PaymentService", serviceChunks[0].Metadata.ClassName);
    }

    [Fact]
    public async Task ParseSourceAsync_WithRepositoryClass_ReturnsRepositoryMethodChunks()
    {
        // Arrange
        const string code = """
            public class OrderRepository
            {
                public Order GetById(int id) => throw new NotImplementedException();
                public void Save(Order order) { }
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "OrderRepository.cs");

        // Assert
        var repoChunks = chunks.Where(c => c.Type == ChunkType.repository_method).ToList();
        Assert.NotEmpty(repoChunks);
        Assert.All(repoChunks, c => Assert.Equal("OrderRepository", c.Metadata.ClassName));
    }

    [Fact]
    public async Task ParseSourceAsync_WithInterface_ReturnsInterfaceChunk()
    {
        // Arrange
        const string code = """
            public interface IUserService
            {
                User GetById(int id);
                void Delete(int id);
            }
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(code, "IUserService.cs");

        // Assert
        var ifaceChunks = chunks.Where(c => c.Type == ChunkType.@interface).ToList();
        Assert.Single(ifaceChunks);
        Assert.Equal("IUserService", ifaceChunks[0].ChunkId);
        Assert.Equal("IUserService", ifaceChunks[0].Metadata.ClassName);
    }

    [Fact]
    public async Task ParseSourceAsync_WithJavaScriptAjaxCall_ExtractsEndpoint()
    {
        // Arrange
        const string js = """
            $.ajax({ url: '/Payment/Save', type: 'POST', data: {} });
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(js, "checkout.js");

        // Assert
        var ajaxChunks = chunks.Where(c => c.Type == ChunkType.js_ajax_call).ToList();
        Assert.NotEmpty(ajaxChunks);
        Assert.Contains("/Payment/Save", ajaxChunks[0].Metadata.AjaxEndpoints);
        Assert.Equal("POST", ajaxChunks[0].Metadata.HttpMethod);
    }

    [Fact]
    public async Task ParseSourceAsync_WithJavaScriptEventHandler_ExtractsSelector()
    {
        // Arrange
        const string js = """
            $('#submitBtn').on('click', function() { console.log('clicked'); });
            """;

        // Act
        var chunks = await CreateService().ParseSourceAsync(js, "ui.js");

        // Assert
        var eventChunks = chunks.Where(c => c.Type == ChunkType.js_event_handler).ToList();
        Assert.NotEmpty(eventChunks);
        Assert.Contains(eventChunks, c => c.Metadata.EventHandlers.Any(e => e.Contains("#submitBtn")));
    }
}
