using Parser.API.Models;
using Parser.API.Services;

namespace Parser.Tests.Unit;

public class ChunkValidatorTests
{
    [Fact]
    public void ValidateChunk_WithEmptyContent_ThrowsArgumentException()
    {
        // Arrange
        var chunk = new ChunkDto
        {
            ChunkId = "Payment.Save.POST",
            File = "PaymentController.cs",
            Type = ChunkType.action_method,
            Content = "",
            Metadata = new ChunkMetadata(),
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => ChunkValidator.Validate(chunk));
    }

    [Fact]
    public void ValidateChunk_WithValidData_ReturnsTrue()
    {
        // Arrange
        var chunk = new ChunkDto
        {
            ChunkId = "Payment.Save.POST",
            File = "PaymentController.cs",
            Type = ChunkType.action_method,
            Content = "public IActionResult Save() => View();",
            Metadata = new ChunkMetadata { HttpMethod = "POST" },
        };

        // Act
        var result = ChunkValidator.Validate(chunk);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void ValidateChunk_WithEmptyChunkId_ThrowsArgumentException()
    {
        // Arrange
        var chunk = new ChunkDto
        {
            ChunkId = "",
            File = "PaymentController.cs",
            Type = ChunkType.action_method,
            Content = "public IActionResult Save() => View();",
            Metadata = new ChunkMetadata(),
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => ChunkValidator.Validate(chunk));
    }
}
