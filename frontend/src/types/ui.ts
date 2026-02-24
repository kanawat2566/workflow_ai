import type { ApprovalPack } from "@/lib/contracts/approval-pack";
import type { AgentState, RunLifecycleStatus } from "@/lib/sse/agent-stream";
import type { SSEEvent } from "@/lib/contracts/sse";

export type UseAgentStreamResult = {
  lifecycle: RunLifecycleStatus;
  agents: AgentState[];
  events: SSEEvent[];
  tokens: string;
  latestError?: string;
  latestApprovalUrl?: string;
  reconnect: () => void;
  disconnect: () => void;
};

export type AgentProgressBoardProps = {
  runId: string;
  initialAgents?: AgentState[];
  agents?: AgentState[];
  lifecycle?: RunLifecycleStatus;
  eventCount?: number;
  latestError?: string;
};

export type ApprovalPackProps = {
  data: ApprovalPack;
};

export type ApprovalButtonsProps = {
  runId: string;
  isSubmitting?: boolean;
  onApprove: (runId: string) => Promise<void> | void;
  onReject: (runId: string, comment: string) => Promise<void> | void;
};

export type FeedbackSubmitPayload = {
  rating: "good" | "bad";
  notes?: string;
};

export type FeedbackBarProps = {
  runId: string;
  onSubmit: (payload: FeedbackSubmitPayload) => Promise<void> | void;
};

export type StreamingChatProps = {
  runId?: string;
  gatewayBaseUrl?: string;
  onRunCreated?: (runId: string) => void;
};
