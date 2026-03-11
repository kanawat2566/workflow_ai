using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Parser.API.Models;
using Parser.API.Services;

namespace Parser.Tests.Unit;

public class CompareServiceTests
{
    private static CompareService CreateService(IRoslynParserService parser) =>
        new(parser, NullLogger<CompareService>.Instance);

    [Fact]
    public async Task CompareAsync_WithNonExistentRepo_ThrowsOrReturnsEmpty()
    {
        // Arrange
        var parserMock = new Mock<IRoslynParserService>();
        var svc = CreateService(parserMock.Object);

        // Act — git will fail gracefully, returning empty diff
        var response = await svc.CompareAsync(
            Path.GetTempPath(), "main", "HEAD", null, CancellationToken.None);

        // Assert — no exception; diff may be empty
        Assert.NotNull(response);
        Assert.NotNull(response.AddedChunks);
        Assert.NotNull(response.DeletedChunks);
        Assert.NotNull(response.ModifiedChunks);
    }

    [Fact]
    public void BuildDiff_AddedChunks_WhenOnlyInHead()
    {
        // Arrange
        var baseChunks = new Dictionary<string, ChunkDto>();
        var headChunk = MakeChunk("SomeService.DoWork", "public void DoWork() {}");
        var headChunks = new Dictionary<string, ChunkDto> { [headChunk.ChunkId] = headChunk };

        // Act
        var result = InvokeBuildDiff(baseChunks, headChunks);

        // Assert
        Assert.Single(result.AddedChunks);
        Assert.Equal("SomeService.DoWork", result.AddedChunks[0].ChunkId);
        Assert.Empty(result.DeletedChunks);
        Assert.Empty(result.ModifiedChunks);
        Assert.Equal(0, result.UnchangedCount);
    }

    [Fact]
    public void BuildDiff_DeletedChunks_WhenOnlyInBase()
    {
        // Arrange
        var baseChunk = MakeChunk("OldService.OldMethod", "public void OldMethod() {}");
        var baseChunks = new Dictionary<string, ChunkDto> { [baseChunk.ChunkId] = baseChunk };
        var headChunks = new Dictionary<string, ChunkDto>();

        // Act
        var result = InvokeBuildDiff(baseChunks, headChunks);

        // Assert
        Assert.Single(result.DeletedChunks);
        Assert.Empty(result.AddedChunks);
        Assert.Empty(result.ModifiedChunks);
        Assert.Equal(1, result.Stats.Deleted);
    }

    [Fact]
    public void BuildDiff_ModifiedChunks_WhenContentDiffers()
    {
        // Arrange
        const string id = "PaymentService.Process";
        var baseChunk = MakeChunk(id, "public void Process() { }");
        var headChunk = MakeChunk(id, "public void Process() { DoExtra(); }");

        var baseChunks = new Dictionary<string, ChunkDto> { [id] = baseChunk };
        var headChunks = new Dictionary<string, ChunkDto> { [id] = headChunk };

        // Act
        var result = InvokeBuildDiff(baseChunks, headChunks);

        // Assert
        Assert.Single(result.ModifiedChunks);
        Assert.Equal(baseChunk, result.ModifiedChunks[0].Before);
        Assert.Equal(headChunk, result.ModifiedChunks[0].After);
        Assert.Equal(1, result.Stats.Modified);
    }

    [Fact]
    public void BuildDiff_UnchangedCount_WhenContentSame()
    {
        // Arrange
        const string id = "OrderService.GetAll";
        var chunk = MakeChunk(id, "public List<Order> GetAll() => [];");
        var baseChunks = new Dictionary<string, ChunkDto> { [id] = chunk };
        var headChunks = new Dictionary<string, ChunkDto> { [id] = chunk };

        // Act
        var result = InvokeBuildDiff(baseChunks, headChunks);

        // Assert
        Assert.Equal(1, result.UnchangedCount);
        Assert.Empty(result.AddedChunks);
        Assert.Empty(result.DeletedChunks);
        Assert.Empty(result.ModifiedChunks);
    }

    [Fact]
    public void BuildDiff_Stats_ReflectsAllCategories()
    {
        // Arrange
        var added = MakeChunk("New.Method", "public void Method() {}");
        var deleted = MakeChunk("Old.Method", "public void OldMethod() {}");
        const string modId = "Mod.Method";
        var modBase = MakeChunk(modId, "public void Method() { }");
        var modHead = MakeChunk(modId, "public void Method() { changed(); }");
        const string sameId = "Same.Method";
        var same = MakeChunk(sameId, "public void Same() {}");

        var baseChunks = new Dictionary<string, ChunkDto>
        {
            [deleted.ChunkId] = deleted,
            [modId] = modBase,
            [sameId] = same,
        };
        var headChunks = new Dictionary<string, ChunkDto>
        {
            [added.ChunkId] = added,
            [modId] = modHead,
            [sameId] = same,
        };

        // Act
        var result = InvokeBuildDiff(baseChunks, headChunks);

        // Assert
        Assert.Equal(1, result.Stats.Added);
        Assert.Equal(1, result.Stats.Modified);
        Assert.Equal(1, result.Stats.Deleted);
        Assert.Equal(1, result.Stats.Unchanged);
    }

    private static ChunkDto MakeChunk(string id, string content) =>
        new()
        {
            ChunkId = id,
            File = "Test.cs",
            Type = ChunkType.service_method,
            Content = content,
            Metadata = new ChunkMetadata { Language = "csharp" },
        };

    // Call the internal BuildDiff method directly (InternalsVisibleTo allows access)
    private static ParseCompareResponse InvokeBuildDiff(
        Dictionary<string, ChunkDto> baseChunks,
        Dictionary<string, ChunkDto> headChunks) =>
        CompareService.BuildDiff(baseChunks, headChunks);
}
