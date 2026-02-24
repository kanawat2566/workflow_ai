import { isApprovalPack, type ApprovalPack } from "./approval-pack";
import { isOptionalString, isRecord, isString } from "./guards";

export const SSE_EVENT_TYPES = [
  "agent_update",
  "run_started",
  "run_completed",
  "run_failed",
  "approval_required",
  "approval_received",
  "stream_token",
  "log",
] as const;

export const AGENT_NAMES = [
  "lead",
  "ba",
  "architect",
  "dev",
  "qa",
  "executor",
  "evaluator",
  "rag",
  "memory",
  "orchestrator",
  "system",
] as const;

export const AGENT_STATUSES = ["waiting", "running", "done", "failed", "skipped"] as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[number];
export type AgentName = (typeof AGENT_NAMES)[number];
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export type ApprovalPackRef = {
  runId?: string;
  approvalUrl?: string;
};

export type SSEEventData = {
  agent?: AgentName;
  status?: AgentStatus;
  message?: string;
  token?: string;
  result?: Record<string, unknown>;
  error?: string;
  approvalPack?: ApprovalPackRef | ApprovalPack;
  timestamp?: string;
};

export type SSEEvent = {
  runId: string;
  event: SSEEventType;
  data: SSEEventData;
};

function isSSEEventType(value: unknown): value is SSEEventType {
  return typeof value === "string" && SSE_EVENT_TYPES.includes(value as SSEEventType);
}

function isAgentName(value: unknown): value is AgentName {
  return typeof value === "string" && AGENT_NAMES.includes(value as AgentName);
}

function isAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === "string" && AGENT_STATUSES.includes(value as AgentStatus);
}

function isApprovalPackRef(value: unknown): value is ApprovalPackRef {
  if (!isRecord(value)) {
    return false;
  }

  return isOptionalString(value.runId) && isOptionalString(value.approvalUrl);
}

function isEventData(value: unknown): value is SSEEventData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.agent === undefined || isAgentName(value.agent)) &&
    (value.status === undefined || isAgentStatus(value.status)) &&
    isOptionalString(value.message) &&
    isOptionalString(value.token) &&
    (value.result === undefined || isRecord(value.result)) &&
    isOptionalString(value.error) &&
    (value.approvalPack === undefined ||
      isApprovalPackRef(value.approvalPack) ||
      isApprovalPack(value.approvalPack)) &&
    isOptionalString(value.timestamp)
  );
}

export function isSSEEvent(value: unknown): value is SSEEvent {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.runId) && isSSEEventType(value.event) && isEventData(value.data);
}

export function parseSSEEvent(value: unknown): SSEEvent | null {
  return isSSEEvent(value) ? value : null;
}

