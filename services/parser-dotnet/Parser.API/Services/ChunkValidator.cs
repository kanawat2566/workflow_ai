using Parser.API.Models;

namespace Parser.API.Services;

public static class ChunkValidator
{
    public static bool Validate(ChunkDto chunk)
    {
        if (string.IsNullOrWhiteSpace(chunk.ChunkId))
            throw new ArgumentException("ChunkId cannot be empty.", nameof(chunk));

        if (string.IsNullOrWhiteSpace(chunk.Content))
            throw new ArgumentException("Content cannot be empty.", nameof(chunk));

        return true;
    }
}
