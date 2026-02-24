# AI Agent 1 — .NET Parser Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Parser Service** เพียงอย่างเดียว
ใช้ **Roslyn API** parse ASP.NET MVC codebase (C#, .cshtml, JavaScript)

## Working Directory
`services/parser-dotnet/`

## Tech Stack
- .NET 8 Web API (ASP.NET Core)
- Microsoft.CodeAnalysis (Roslyn) — parse C#
- Microsoft.CodeAnalysis.CSharp — AST traversal
- Dockerfile: ใช้ `../../infra/docker/dotnet.Dockerfile`

## Internal Port
`5100` (ตาม `shared/contracts/ports.json`)

## Contract ที่ต้องยึด

### Output Schema
อ่าน: `../../shared/contracts/chunk_schema.json`
ทุก chunk ที่ส่งออกต้องตรงตาม schema นี้

### Endpoints ที่ต้องสร้าง
```
POST /parse/repo
  body: { repoPath: string, branch?: string, modules?: string[] }
  return: { chunks: Chunk[], routeMap: RouteEntry[], stats: ParseStats }

POST /parse/file
  body: { filePath: string }
  return: { chunks: Chunk[] }

GET /parse/routes
  query: ?repoPath=...
  return: { routes: RouteEntry[] }

POST /parse/incremental
  body: { changedFiles: string[] }
  return: { updatedChunks: Chunk[] }

GET /health
  return: { status: "ok" }
```

## สิ่งที่ต้อง Parse

### C# Controllers (.cs)
- ทุก Action Method → chunkId = `{ControllerName}.{ActionName}.{HttpMethod}`
- Extract: route, httpMethod, parameters, viewModel, calls, returns

### ViewModels / Models (.cs)
- ทุก class → properties, data annotations ([Required], [Range])
- EF DbSet → DB table names

### Razor Views (.cshtml)
- @model declaration
- @Html.BeginForm → form action/method
- @Html.Partial / @Html.RenderPartial → partial names
- @section Scripts { } → JS files referenced

### JavaScript / jQuery (.js)
- ทุก function → chunk แยก
- $.ajax calls → extract URL, method
- $('selector').on('event') → event handlers

## สิ่งที่ต้องการ RouteMapEntry
```csharp
public class RouteEntry {
    public string Route { get; set; }        // /Payment/Save
    public string Controller { get; set; }
    public string Action { get; set; }
    public string HttpMethod { get; set; }
    public string ViewPath { get; set; }     // Views/Payment/Save.cshtml
    public string ViewModel { get; set; }
}
```

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/parser-dotnet/
├── Parser.API/
│   └── Services/
│       ├── RoslynParserService.cs
│       └── RouteMapService.cs
└── Parser.Tests/
    ├── Parser.Tests.csproj
    ├── Unit/
    │   ├── RoslynParserServiceTests.cs  ← test parse logic with sample C# strings
    │   ├── RouteMapServiceTests.cs      ← test route extraction
    │   └── ChunkValidatorTests.cs       ← test ChunkDto validation
    └── Integration/
        └── ParseControllerTests.cs      ← test with WebApplicationFactory
```

### Test Naming (xUnit)
```csharp
// {Method}_{Scenario}_{ExpectedBehavior}
ParseFileAsync_WithHttpPostAction_ReturnsChunkWithCorrectId()
ParseFileAsync_WithEmptyFile_ReturnsEmptyArray()
ExtractRoutes_WithAreaAttribute_IncludesAreaInRoute()
ValidateChunk_WithEmptyContent_ThrowsArgumentException()
```

### Key Test Cases
```csharp
[Fact]
public async Task ParseFileAsync_WithControllerAction_ExtractsCorrectHttpMethod()
{
    // Arrange — ใช้ inline C# string แทนไฟล์จริง
    const string code = @"
        public class PaymentController : Controller {
            [HttpPost]
            public IActionResult Save(PaymentViewModel m) => View();
        }";

    // Act
    var chunks = await _service.ParseFileAsync(code, "PaymentController.cs");

    // Assert
    Assert.Single(chunks);
    Assert.Equal("POST", chunks[0].Metadata["httpMethod"]);
}

[Theory]
[InlineData("[HttpGet]", "GET")]
[InlineData("[HttpPost]", "POST")]
[InlineData("[HttpPut]", "PUT")]
[InlineData("[HttpDelete]", "DELETE")]
public async Task ParseFileAsync_WithDifferentHttpAttributes_ExtractsCorrectMethod(
    string attribute, string expectedMethod) { ... }
```

### NuGet Test Packages
```xml
<PackageReference Include="xunit" Version="2.*" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
<PackageReference Include="Moq" Version="4.*" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.*" />
<PackageReference Include="coverlet.collector" Version="6.*" />
```

### Coverage
รัน: `dotnet test --collect:"XPlat Code Coverage"` → ต้องได้ ≥ 70%

## ห้ามแก้ไฟล์นอก working directory
ถ้าต้องการเปลี่ยน contract → แจ้ง human ก่อน
