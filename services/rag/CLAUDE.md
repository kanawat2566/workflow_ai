# AI Agent 2 — RAG Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **RAG Service** (Retrieval-Augmented Generation)
รับ chunks จาก .NET Parser → embed → store → hybrid search

## Working Directory
`services/rag/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- LlamaIndex — indexing pipeline
- Qdrant — vector store
- OpenSearch — BM25 keyword search
- BGE-Reranker (via sentence-transformers) — re-ranking
- Google `text-embedding-004` — embedding (free tier)
- httpx — call parser-dotnet service

## Internal Port
`8002` (ตาม `shared/contracts/ports.json`)

## Service URLs (Docker network)
```
parser-dotnet : http://parser-dotnet:5100
qdrant        : http://qdrant:6333
opensearch    : http://opensearch:9200
```

## Contracts

### Input (จาก .NET Parser)
อ่าน: `../../shared/contracts/chunk_schema.json`

### Output
อ่าน: `../../shared/contracts/retrieve_schema.json`

## Endpoints ที่ต้องสร้าง
```
POST /index/scan
  body: { repoPath: string, branch?: string }
  action: เรียก parser-dotnet → embed chunks → store ใน Qdrant + OpenSearch
  return: { jobId: string, status: "queued" }

POST /index/incremental
  body: { changedFiles: string[] }
  return: { updated: int }

POST /retrieve
  body: { query: string, topK?: int, module?: string, fileTypes?: string[] }
  return: RetrieveResponse (ตาม retrieve_schema.json)

GET /health
  return: { status: "ok", qdrant: bool, opensearch: bool }
```

## Hybrid Search Flow
```
query
  ├─ Semantic: embed query → Qdrant search → top 20
  ├─ BM25: OpenSearch query → top 20
  └─ Merge + Re-rank (BGE-Reranker) → top K
```

## Qdrant Collections
- `code_chunks` — all chunks from .NET Parser
- `file_summaries` — LLM-generated summary per file (hierarchical layer 1)

## ห้ามแก้ไฟล์นอก working directory
