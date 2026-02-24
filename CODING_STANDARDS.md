# Coding Standards — AI Agent Platform

> **ทุก AI agent ต้องอ่านและปฏิบัติตามเอกสารนี้ก่อนเขียน code ทุกบรรทัด**

---

## 1. หลักการทั่วไป (Universal Principles)

### SOLID
| หลักการ | ความหมาย | ตัวอย่างการละเมิด |
|---------|---------|-----------------|
| **S** — Single Responsibility | 1 class/function = 1 หน้าที่ | `UserService` ที่ทำทั้ง auth, email, และ report |
| **O** — Open/Closed | เพิ่มได้ไม่ต้องแก้ | if/elif ยาวๆ แทน polymorphism |
| **L** — Liskov Substitution | subclass ใช้แทน base ได้เสมอ | override แล้ว throw exception |
| **I** — Interface Segregation | interface เล็กๆ เฉพาะทาง | interface ใหญ่ที่ implement ครึ่งเดียว |
| **D** — Dependency Inversion | depend on abstraction ไม่ใช่ implementation | new Database() ตรงๆ ใน business logic |

### DRY, KISS, YAGNI
- **DRY**: อย่า copy-paste logic — extract เป็น function/module
- **KISS**: เลือก solution ง่ายที่สุดที่ทำงานได้ก่อนเสมอ
- **YAGNI**: อย่าสร้าง feature ที่ยัง "อาจจะใช้ในอนาคต"

### ขนาด (Size Limits)
| หน่วย | ขีดสูงสุด |
|------|---------|
| Function / Method | **20 บรรทัด** (ไม่นับ blank line + docstring) |
| Class | **200 บรรทัด** |
| File | **400 บรรทัด** |
| Parameter ต่อ function | **4 ตัว** (เกินกว่านี้ใช้ dataclass/model) |

### Naming Rules (ทุกภาษา)
- ชื่อต้อง **บอกความหมาย** — ห้ามใช้ `d`, `tmp`, `x`, `data2`
- ชื่อ boolean ขึ้นต้นด้วย `is_`, `has_`, `can_`, `should_`
- ชื่อ function เป็น **verb + noun** — `calculate_total()`, `send_approval()`
- ห้ามใช้ตัวย่อที่ไม่ชัดเจน — `usr` → `user`, `msg` → `message`

---

## 2. Python Standards (services/*)

### Naming Conventions
```python
# ✅ ถูก
module_name = "snake_case"
class ClassName:           # PascalCase
    def method_name(self): # snake_case
        local_var = 1      # snake_case

CONSTANT_VALUE = 42        # UPPER_SNAKE_CASE

# ❌ ผิด
class myClass: ...
def DoSomething(): ...
myVar = 1
```

### Type Hints — บังคับทุก function
```python
# ✅ ถูก — type hints ครบ
async def retrieve_chunks(
    query: str,
    top_k: int = 5,
    filters: dict[str, str] | None = None,
) -> list[ChunkDto]:
    ...

# ❌ ผิด — ไม่มี type hints
def retrieve_chunks(query, top_k=5, filters=None):
    ...
```

### Docstrings — บังคับสำหรับ public function/class
```python
# ✅ ถูก
async def index_repository(repo_path: str) -> IndexResult:
    """
    Index ทั้ง repository เข้า Qdrant.

    Args:
        repo_path: absolute path ไปยัง repo ที่ clone แล้ว

    Returns:
        IndexResult ที่มี chunk count และ embedding stats

    Raises:
        RepoNotFoundError: ถ้า repo_path ไม่มีอยู่
    """
    ...
```

### Error Handling
```python
# ✅ ถูก — specific exception, log ก่อน raise
try:
    result = await parser_client.parse_repo(repo_path)
except httpx.TimeoutException as exc:
    logger.error("Parser timeout", repo=repo_path, exc_info=exc)
    raise ParserTimeoutError(f"Parser did not respond within {TIMEOUT}s") from exc

# ❌ ผิด — catch all, ไม่ log
try:
    result = await parser_client.parse_repo(repo_path)
except Exception:
    pass
```

### Async Rules
```python
# ✅ ถูก — ใช้ async/await สม่ำเสมอ
async def fetch_and_index(repo_path: str) -> None:
    chunks = await parse_repo(repo_path)
    await embed_chunks(chunks)

# ❌ ผิด — blocking call ใน async context
async def bad_example() -> None:
    time.sleep(5)           # ห้าม: ใช้ asyncio.sleep แทน
    result = requests.get(url)  # ห้าม: ใช้ httpx.AsyncClient แทน
```

### Imports
```python
# ลำดับ: stdlib → third-party → local (แยกด้วย blank line)
import asyncio
import json
from pathlib import Path

import httpx
from fastapi import FastAPI

from services.gateway.models import CommandRequest
```

### Class Design
```python
# ✅ ถูก — inject dependencies
class RagService:
    def __init__(
        self,
        qdrant_client: QdrantClient,
        embedder: BaseEmbedder,
    ) -> None:
        self._qdrant = qdrant_client
        self._embedder = embedder

# ❌ ผิด — สร้าง dependency ตรงๆ
class RagService:
    def __init__(self) -> None:
        self._qdrant = QdrantClient(host="qdrant")  # hard-coded!
```

---

## 3. .NET C# Standards (services/parser-dotnet/)

### Naming Conventions
```csharp
// ✅ ถูก
public class RoslynParserService      // PascalCase class
{
    private readonly ILogger _logger; // _camelCase field

    public async Task<ChunkDto[]> ParseFileAsync(string filePath) // PascalCase method + Async suffix
    {
        var chunkList = new List<ChunkDto>(); // camelCase local var
        const int MaxRetries = 3;             // PascalCase const
        ...
    }
}

// ❌ ผิด
public class roslynparser { }
public void parsefile() { }
```

### Async/Await — บังคับทุก I/O
```csharp
// ✅ ถูก
public async Task<ParseResult> ParseRepoAsync(string repoPath, CancellationToken ct = default)
{
    var files = await GetCsharpFilesAsync(repoPath, ct);
    var chunks = await ParseFilesAsync(files, ct);
    return new ParseResult(chunks);
}

// ❌ ผิด — blocking
public ParseResult ParseRepo(string repoPath)
{
    var result = ParseRepoAsync(repoPath).Result; // deadlock risk!
    return result;
}
```

### Null Safety
```csharp
// ✅ ถูก — nullable reference types enabled (#nullable enable)
public string? GetActionRoute(MethodDeclarationSyntax method)
{
    var attr = method.AttributeLists
        .SelectMany(al => al.Attributes)
        .FirstOrDefault(a => a.Name.ToString() is "HttpGet" or "HttpPost");

    return attr is null ? null : ExtractRoute(attr);
}
```

### Dependency Injection — ใช้ Constructor Injection เสมอ
```csharp
// ✅ ถูก
public class ParseController(
    IRoslynParserService parser,
    ILogger<ParseController> logger) : ControllerBase
{
    [HttpPost("parse/repo")]
    public async Task<ActionResult<ParseResult>> ParseRepo(
        [FromBody] ParseRepoRequest request,
        CancellationToken ct)
    {
        var result = await parser.ParseRepoAsync(request.RepoPath, ct);
        return Ok(result);
    }
}
```

### Error Handling — Global Exception Middleware
```csharp
// ทุก service ต้องมี global error handler — ไม่ใช้ try/catch ทั่วๆ ไปใน controller
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var problem = context.Features.Get<IExceptionHandlerFeature>();
        logger.LogError(problem?.Error, "Unhandled exception");
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = "Internal error" });
    });
});
```

### LINQ Rules
```csharp
// ✅ ถูก — ใช้ LINQ อ่านง่าย แต่ไม่ซับซ้อนเกิน
var publicActions = methods
    .Where(m => m.Modifiers.Any(mod => mod.IsKind(SyntaxKind.PublicKeyword)))
    .Where(m => m.AttributeLists.Any())
    .Select(m => new ActionInfo(m))
    .ToList();

// ❌ ผิด — nested LINQ ที่อ่านยาก → extract เป็น method แทน
```

---

## 4. TypeScript / Next.js Standards (frontend/)

### Naming Conventions
```typescript
// ✅ ถูก
const userId = "abc";              // camelCase variable
function calculateTotal(): number  // camelCase function
interface ApprovalPackProps { }    // PascalCase interface
type AgentStatus = "running" | "done" | "failed"; // PascalCase type
const MAX_RETRY = 3;               // UPPER_SNAKE_CASE constant
```

### Type Safety — ห้าม `any`
```typescript
// ✅ ถูก
interface SseEvent {
  runId: string;
  event: "agent_update" | "completed" | "failed";
  data: AgentUpdateData;
}

async function streamEvents(runId: string): Promise<void> {
  const eventSource = new EventSource(`/api/stream/${runId}`);
  eventSource.onmessage = (e: MessageEvent<string>) => {
    const event: SseEvent = JSON.parse(e.data);
    handleEvent(event);
  };
}

// ❌ ผิด
function handleEvent(data: any) { ... }  // ห้ามใช้ any
```

### React Component Rules
```typescript
// ✅ ถูก — component เล็ก, single responsibility, props typed
interface AgentCardProps {
  agentName: string;
  status: AgentStatus;
  message?: string;
}

export function AgentCard({ agentName, status, message }: AgentCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", statusClass[status])}>
      <span className="font-semibold">{agentName}</span>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

// ❌ ผิด — component ใหญ่เกิน 100 บรรทัด → แตกเป็น sub-component
```

### Hooks Rules
```typescript
// ✅ ถูก — custom hook สำหรับ SSE logic
function useAgentStream(runId: string) {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/stream/${runId}`);
    es.onmessage = (e) => {
      const event: SseEvent = JSON.parse(e.data);
      if (event.event === "agent_update") {
        setAgents(prev => updateAgent(prev, event.data));
      } else if (event.event === "completed") {
        setIsComplete(true);
        es.close();
      }
    };
    return () => es.close(); // cleanup สำคัญมาก
  }, [runId]);

  return { agents, isComplete };
}
```

### Server vs Client Component
```typescript
// Server Component (default) — ไม่ใช้ useState/useEffect
// ✅ ใช้สำหรับ: data fetching, static content
export default async function HistoryPage() {
  const runs = await fetchRuns(); // direct server call
  return <RunList runs={runs} />;
}

// Client Component — ใช้ "use client" เฉพาะเมื่อจำเป็น
"use client";
// ✅ ใช้สำหรับ: interactivity, SSE, browser APIs
export function StreamingChat() { ... }
```

---

## 5. Unit Test Requirements

### 5.1 Python (pytest)

#### โครงสร้าง Test Directory
```
services/{service-name}/
├── src/
│   └── {service_name}/
│       ├── __init__.py
│       └── router.py
└── tests/
    ├── __init__.py
    ├── unit/                    ← unit tests (no external deps)
    │   ├── __init__.py
    │   ├── test_router.py
    │   └── test_service.py
    └── integration/             ← integration tests (ใช้ docker)
        ├── __init__.py
        └── test_api.py
```

#### Naming Convention
```python
# ไฟล์: test_{module_name}.py
# Function: test_{method}_{scenario}_{expected_result}

def test_parse_controller_with_http_post_returns_chunk():
    ...

def test_retrieve_chunks_when_qdrant_unavailable_raises_retrieval_error():
    ...

def test_send_approval_with_invalid_run_id_returns_404():
    ...
```

#### AAA Pattern (Arrange-Act-Assert) — บังคับทุก test
```python
async def test_embed_chunks_returns_vectors_with_correct_dimension():
    # Arrange
    embedder = FakeEmbedder(dimension=768)
    chunks = [ChunkDto(chunkId="test.1", content="hello world", metadata={})]

    # Act
    vectors = await embedder.embed(chunks)

    # Assert
    assert len(vectors) == 1
    assert len(vectors[0]) == 768
```

#### Mocking External Dependencies
```python
# ✅ ถูก — mock external service, test business logic เท่านั้น
@pytest.mark.asyncio
async def test_index_repository_calls_parser_with_correct_path(
    mock_parser_client: AsyncMock,
    mock_qdrant_client: MagicMock,
) -> None:
    # Arrange
    service = RagService(qdrant=mock_qdrant_client, parser=mock_parser_client)
    mock_parser_client.parse_repo.return_value = [sample_chunk()]

    # Act
    result = await service.index_repository("/repos/myapp")

    # Assert
    mock_parser_client.parse_repo.assert_called_once_with("/repos/myapp")
    assert result.chunk_count == 1
```

#### Fixtures — ใช้ conftest.py
```python
# tests/conftest.py
import pytest
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def mock_qdrant_client() -> MagicMock:
    return MagicMock(spec=QdrantClient)

@pytest.fixture
def mock_parser_client() -> AsyncMock:
    return AsyncMock(spec=ParserClient)

@pytest.fixture
def sample_chunk() -> ChunkDto:
    return ChunkDto(
        chunkId="PaymentController.Save.POST",
        content="public async Task<IActionResult> Save(PaymentViewModel model)",
        metadata={"controller": "PaymentController", "action": "Save"},
    )
```

#### Coverage Requirement
```toml
# pyproject.toml — ตั้งไว้แล้ว
[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=70"
```

### 5.2 .NET xUnit

#### โครงสร้าง Test Project
```
services/parser-dotnet/
├── Parser.API/
│   └── Services/
│       └── RoslynParserService.cs
└── Parser.Tests/
    ├── Parser.Tests.csproj
    ├── Unit/
    │   ├── RoslynParserServiceTests.cs
    │   └── RouteMapServiceTests.cs
    └── Integration/
        └── ParseControllerTests.cs
```

#### Naming Convention + AAA Pattern
```csharp
public class RoslynParserServiceTests
{
    // ชื่อ method: {Method}_{Scenario}_{ExpectedBehavior}
    [Fact]
    public async Task ParseFileAsync_WithValidController_ReturnsActionChunks()
    {
        // Arrange
        var mockLogger = new Mock<ILogger<RoslynParserService>>();
        var service = new RoslynParserService(mockLogger.Object);
        var csContent = @"
            public class PaymentController : Controller {
                [HttpPost]
                public IActionResult Save(PaymentViewModel model) => View();
            }";

        // Act
        var chunks = await service.ParseFileAsync(csContent, "PaymentController.cs");

        // Assert
        Assert.Single(chunks);
        Assert.Equal("PaymentController.Save.POST", chunks[0].ChunkId);
    }

    [Theory]
    [InlineData("", 0)]
    [InlineData("// comment only", 0)]
    public async Task ParseFileAsync_WithNoActions_ReturnsEmptyChunks(
        string content, int expectedCount)
    {
        // Arrange
        var service = CreateService();

        // Act
        var chunks = await service.ParseFileAsync(content, "Empty.cs");

        // Assert
        Assert.Equal(expectedCount, chunks.Length);
    }

    private static RoslynParserService CreateService() =>
        new(NullLogger<RoslynParserService>.Instance);
}
```

#### Mock External Dependencies
```csharp
// ใช้ Moq สำหรับ interface mocking
[Fact]
public async Task ParseRepoAsync_CallsFileServiceWithCorrectPath()
{
    // Arrange
    var mockFileService = new Mock<IFileService>();
    mockFileService.Setup(f => f.GetCsharpFilesAsync(It.IsAny<string>(), default))
        .ReturnsAsync(new[] { "/repos/app/PaymentController.cs" });

    var service = new RoslynParserService(mockFileService.Object, NullLogger<RoslynParserService>.Instance);

    // Act
    await service.ParseRepoAsync("/repos/app");

    // Assert
    mockFileService.Verify(f => f.GetCsharpFilesAsync("/repos/app", default), Times.Once);
}
```

#### Coverage Requirement
```xml
<!-- Parser.Tests/Parser.Tests.csproj -->
<ItemGroup>
  <PackageReference Include="coverlet.collector" Version="6.*" />
</ItemGroup>
<!-- รัน: dotnet test --collect:"XPlat Code Coverage" -->
<!-- ต้องได้ ≥70% line coverage -->
```

### 5.3 TypeScript / Next.js (Jest + Testing Library)

#### โครงสร้าง Test Directory
```
frontend/
├── src/
│   ├── components/
│   │   └── AgentCard.tsx
│   └── hooks/
│       └── useAgentStream.ts
└── __tests__/
    ├── components/
    │   └── AgentCard.test.tsx
    └── hooks/
        └── useAgentStream.test.ts
```

#### Naming Convention
```typescript
// ไฟล์: {ComponentName}.test.tsx หรือ {hookName}.test.ts
// Describe: ชื่อ component/hook
// It: "should {expected behavior} when {scenario}"

describe("AgentCard", () => {
  it("should display agent name and status badge", () => {
    // Arrange
    render(<AgentCard agentName="orchestrator" status="running" />);

    // Assert
    expect(screen.getByText("orchestrator")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("should show message when provided", () => {
    render(<AgentCard agentName="ba" status="done" message="วิเคราะห์เสร็จแล้ว" />);
    expect(screen.getByText("วิเคราะห์เสร็จแล้ว")).toBeInTheDocument();
  });

  it("should not show message element when message is undefined", () => {
    render(<AgentCard agentName="dev" status="waiting" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
import { renderHook, act } from "@testing-library/react";

describe("useAgentStream", () => {
  it("should update agents when SSE event is received", async () => {
    // Arrange
    const mockEventSource = createMockEventSource();
    vi.stubGlobal("EventSource", mockEventSource.constructor);

    // Act
    const { result } = renderHook(() => useAgentStream("run-123"));
    act(() => {
      mockEventSource.emit("message", {
        data: JSON.stringify({
          event: "agent_update",
          data: { agent: "ba", status: "running", message: "Analyzing..." },
        }),
      });
    });

    // Assert
    expect(result.current.agents).toHaveLength(1);
    expect(result.current.agents[0].status).toBe("running");
  });

  it("should close event source on unmount", () => {
    const { unmount } = renderHook(() => useAgentStream("run-456"));
    unmount();
    expect(mockEventSource.close).toHaveBeenCalledOnce();
  });
});
```

#### Coverage Requirement
```json
// jest.config.js / vitest.config.ts
{
  "coverageThreshold": {
    "global": {
      "lines": 70,
      "functions": 70,
      "branches": 70
    }
  }
}
```

---

## 6. Code Review Checklist

ก่อน commit ทุกครั้ง ตรวจสอบ:

### General
- [ ] Function/method ≤ 20 บรรทัด
- [ ] ไม่มี magic number — ใช้ named constant แทน
- [ ] ไม่มี commented-out code
- [ ] ไม่มี `TODO` ที่ไม่มี issue/ticket อ้างอิง
- [ ] ชื่อตัวแปร/function สื่อความหมาย

### Python
- [ ] Type hints ครบทุก function signature
- [ ] Docstring สำหรับ public function
- [ ] ไม่มี bare `except:` หรือ `except Exception: pass`
- [ ] ไม่มี blocking I/O ใน async function
- [ ] Unit test ครอบคลุม happy path + error path

### .NET C#
- [ ] `Async` suffix สำหรับ async method
- [ ] `CancellationToken` parameter ใน async method
- [ ] `#nullable enable` อยู่ใน global config
- [ ] ใช้ `record` หรือ `readonly` สำหรับ immutable data
- [ ] Unit test ครอบคลุม happy path + edge cases

### TypeScript
- [ ] ไม่มี `any` type
- [ ] Props interface/type ครบทุก component
- [ ] `useEffect` cleanup function ถ้า subscribe event/timer
- [ ] Server Component โดย default, `"use client"` เฉพาะจำเป็น
- [ ] Test ครอบคลุม render + interaction + error states

---

## 7. Anti-Patterns ที่ห้ามทำ

```
❌ God Class       — class ที่รู้ทุกอย่างและทำทุกอย่าง
❌ Spaghetti Code  — flow ซับซ้อน ติดตามยาก, return หลายที่โดยไม่จำเป็น
❌ Magic Numbers   — if status == 3 (ควรเป็น if status == Status.FAILED)
❌ Deep Nesting    — if ใน if ใน for ใน if เกิน 3 ระดับ → extract function
❌ Premature Opt   — optimize ก่อนที่จะรู้ว่า bottleneck อยู่ที่ไหน
❌ Silent Failure  — catch exception แล้วไม่ทำอะไร (ไม่ log, ไม่ re-raise)
❌ Hard-coded URL  — "http://qdrant:6333" ใน code → ใช้ env var
❌ Test Pollution  — tests ที่ depend on order หรือ shared mutable state
```

---

## 8. ตัวอย่าง Test ที่ดี (Quick Reference)

```python
# Python — pytest
class TestChunkValidator:
    def test_validate_chunk_with_empty_content_raises_value_error(self):
        chunk = ChunkDto(chunkId="x", content="", metadata={})
        with pytest.raises(ValueError, match="content cannot be empty"):
            validate_chunk(chunk)

    def test_validate_chunk_with_valid_data_returns_true(self):
        chunk = ChunkDto(chunkId="x.y.GET", content="code", metadata={"type": "action"})
        assert validate_chunk(chunk) is True
```

```csharp
// C# — xUnit
[Fact]
public void ValidateChunk_WithEmptyContent_ThrowsArgumentException()
{
    var chunk = new ChunkDto { ChunkId = "x", Content = "" };
    Assert.Throws<ArgumentException>(() => ChunkValidator.Validate(chunk));
}
```

```typescript
// TypeScript — Vitest/Jest
describe("validateChunk", () => {
  it("should throw when content is empty", () => {
    expect(() => validateChunk({ chunkId: "x", content: "" }))
      .toThrow("content cannot be empty");
  });
});
```
