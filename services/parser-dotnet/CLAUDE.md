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

## ห้ามแก้ไฟล์นอก working directory
ถ้าต้องการเปลี่ยน contract → แจ้ง human ก่อน
