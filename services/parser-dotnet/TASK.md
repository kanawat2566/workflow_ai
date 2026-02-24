## Parser-DotNet Implementation Checklist

### Phase 0 — Project Setup
- [ ] 1.1 สร้าง Parser.sln + Parser.API.csproj + Parser.Tests.csproj
- [ ] 1.2 เพิ่ม NuGet: Roslyn, xUnit, Moq, coverlet, AspNetCore.Mvc.Testing

### Phase 1 — Models & Interfaces
- [ ] 1.3 Models/ChunkDto.cs (ตาม chunk_schema.json)
- [ ] 1.4 Models/RouteEntry.cs, ParseStats.cs, Request/Response DTOs
- [ ] 1.5 Interfaces/IRoslynParserService.cs + IRouteMapService.cs

### Phase 2 — Services
- [ ] 1.6 Services/RoslynParserService.cs
  - [ ] Parse C# Controllers → action_method chunks
  - [ ] Parse ViewModels / EF Models → viewmodel, ef_model chunks
  - [ ] Parse Razor .cshtml → razor_view chunks
  - [ ] Parse JS functions / $.ajax / events → js_* chunks
- [ ] 1.7 Services/RouteMapService.cs
  - [ ] Extract routes จาก Controller attributes
  - [ ] Map Controller → Action → ViewPath → ViewModel

### Phase 3 — API Layer
- [ ] 1.8 Controllers/ParseController.cs
  - [ ] POST /parse/repo
  - [ ] POST /parse/file
  - [ ] GET  /parse/routes
  - [ ] POST /parse/incremental
- [ ] 1.9 Controllers/HealthController.cs → GET /health
- [ ] 1.10 Program.cs (DI + port 5100 + Global Exception Middleware)

### Phase 4 — Tests (ต้องได้ ≥70% coverage)
- [ ] 1.11 Unit/RoslynParserServiceTests.cs
  - [ ] ParseFileAsync_WithHttpPostAction_ReturnsCorrectChunkId
  - [ ] ParseFileAsync_WithEmptyFile_ReturnsEmptyArray
  - [ ] ParseFileAsync_WithDifferentHttpMethods (Theory: GET/POST/PUT/DELETE)
  - [ ] ParseFileAsync_WithViewModel_ExtractsProperties
- [ ] 1.12 Unit/RouteMapServiceTests.cs
  - [ ] ExtractRoutes_WithAreaAttribute_IncludesAreaInRoute
  - [ ] ExtractRoutes_WithNoController_ReturnsEmpty
- [ ] 1.13 Unit/ChunkValidatorTests.cs
  - [ ] ValidateChunk_WithEmptyContent_ThrowsArgumentException
  - [ ] ValidateChunk_WithValidData_ReturnsTrue
- [ ] 1.14 Integration/ParseControllerTests.cs
  - [ ] POST /parse/file → 200 + valid chunks
  - [ ] POST /parse/repo → routeMap ครบ
  - [ ] GET /health → {status: "ok"}

### Phase 5 — Docker & Contract
- [ ] 1.15 docker build ผ่าน (ใช้ infra/docker/dotnet.Dockerfile)
- [ ] 1.16 tests/contract/validate_schema.sh (ตรวจ output vs chunk_schema.json)

### Git & CI
- [ ] 1.17 dotnet format ไม่มี warning
- [ ] 1.18 CI ผ่านทุก 6 Gates บน feat/parser-dotnet
- [ ] 1.19 เปิด PR → main + Quality Gate ผ่าน
- [ ] 1.20 Merge to main
