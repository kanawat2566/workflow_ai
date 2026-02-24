"""
Shared LangGraph AgentState — used by Orchestrator service.
All agent nodes read/write this state.
"""
from typing import TypedDict, Annotated, List, Optional, Any
from enum import Enum
import operator


class AgentStatus(str, Enum):
    WAITING = "waiting"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"
    SKIPPED = "skipped"


class UseCase(str, Enum):
    DOC_GENERATION = "doc_generation"
    WEB_APP_CREATION = "web_app_creation"
    BOT_TEAM_SPEC = "bot_team_spec"
    MEDIA_GENERATION = "media_generation"


class AgentState(TypedDict):
    # --- Run info ---
    run_id: str
    use_case: UseCase
    user_id: str
    request: str                          # original user request

    # --- Memory / Context ---
    user_prefs: dict                      # from Memory Service
    rag_chunks: list                      # from RAG Service
    citations: list

    # --- Agent outputs (accumulated via operator.add) ---
    messages: Annotated[list, operator.add]   # LLM message history

    # --- BotTeam parallel results ---
    ba_result: Optional[dict]             # BA Agent output
    arch_result: Optional[dict]           # Architect Agent output
    dev_result: Optional[dict]            # Dev Agent output
    qa_result: Optional[dict]             # QA Agent output

    # --- Artifacts ---
    artifacts: Optional[dict]             # Executor output
    diff: Optional[str]
    evaluation_score: Optional[float]
    evaluation_issues: Optional[list]
    evaluation_passed: Optional[bool]

    # --- Approval ---
    approval_pack: Optional[dict]
    approval_status: Optional[str]        # pending / approved / rejected
    rejection_comment: Optional[str]

    # --- Execution results ---
    pr_url: Optional[str]
    commit_hash: Optional[str]

    # --- Per-agent status (for SSE streaming to frontend) ---
    agent_statuses: dict                  # {agent_name: AgentStatus}

    # --- Loop control ---
    fix_iteration: int                    # quality gate fix loop count
    max_fix_iterations: int              # default 3

    # --- Error ---
    error: Optional[str]
