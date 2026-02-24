using Parser.API.Models;

namespace Parser.API.Services;

public interface IRoslynParserService
{
    /// <summary>
    /// Parse ทั้ง repo — คืน chunks จากทุกไฟล์ .cs, .cshtml, .js
    /// </summary>
    Task<List<ChunkDto>> ParseRepoAsync(string repoPath, IEnumerable<string>? modules, CancellationToken ct = default);

    /// <summary>
    /// Parse source code string โดยตรง (ไม่ต้องการไฟล์จริง — ใช้ใน unit tests)
    /// </summary>
    Task<List<ChunkDto>> ParseSourceAsync(string sourceCode, string fileName, CancellationToken ct = default);

    /// <summary>
    /// Parse ไฟล์เดี่ยวจาก disk
    /// </summary>
    Task<List<ChunkDto>> ParseFileAsync(string filePath, CancellationToken ct = default);
}
