import {
  AGENT_NAMES,
  type AgentName,
  type AgentStatus,
  parseSSEEvent,
  type SSEEvent,
} from "@/lib/contracts/sse";

export type AgentState = {
  name: AgentName;
  status: AgentStatus;
  message?: string;
  updatedAt?: string;
};

export type RunLifecycleStatus =
  | "idle"
  | "connecting"
  | "running"
  | "completed"
  | "failed"
  | "disconnected";

export type AgentStreamState = {
  runId: string;
  lifecycle: RunLifecycleStatus;
  agents: AgentState[];
  events: SSEEvent[];
  tokens: string;
  latestError?: string;
  latestApprovalUrl?: string;
};

export const DEFAULT_AGENT_STATES: AgentState[] = AGENT_NAMES.map((name) => ({
  name,
  status: "waiting",
}));

export function createInitialAgentStreamState(runId: string): AgentStreamState {
  return {
    runId,
    lifecycle: "idle",
    agents: [...DEFAULT_AGENT_STATES],
    events: [],
    tokens: "",
  };
}

export function parseSSEMessageData(rawData: string): SSEEvent | null {
  try {
    const parsed = JSON.parse(rawData) as unknown;
    return parseSSEEvent(parsed);
  } catch {
    return null;
  }
}

function updateAgentState(agents: AgentState[], event: SSEEvent): AgentState[] {
  if (!event.data.agent || !event.data.status) {
    return agents;
  }

  const nextAgentName = event.data.agent;
  const nextStatus = event.data.status;
  const nextMessage = event.data.message;
  const nextUpdatedAt = event.data.timestamp ?? new Date().toISOString();

  return agents.map((agent) => {
    if (agent.name !== nextAgentName) {
      return agent;
    }

    return {
      ...agent,
      status: nextStatus,
      message: nextMessage ?? agent.message,
      updatedAt: nextUpdatedAt,
    };
  });
}

export function reduceAgentStreamEvent(
  state: AgentStreamState,
  event: SSEEvent,
): AgentStreamState {
  const nextState: AgentStreamState = {
    ...state,
    events: [...state.events, event],
  };

  if (event.event === "agent_update") {
    nextState.agents = updateAgentState(state.agents, event);
    nextState.lifecycle = event.data.status === "failed" ? "failed" : "running";
  }

  if (event.event === "run_started") {
    nextState.lifecycle = "running";
  }

  if (event.event === "run_completed") {
    nextState.lifecycle = "completed";
  }

  if (event.event === "run_failed") {
    nextState.lifecycle = "failed";
    nextState.latestError = event.data.error ?? event.data.message ?? "Run failed";
  }

  if (event.event === "stream_token" && event.data.token) {
    nextState.tokens = `${state.tokens}${event.data.token}`;
  }

  if (event.event === "approval_required" && event.data.approvalPack) {
    nextState.latestApprovalUrl =
      "approvalUrl" in event.data.approvalPack
        ? event.data.approvalPack.approvalUrl
        : undefined;
  }

  return nextState;
}
