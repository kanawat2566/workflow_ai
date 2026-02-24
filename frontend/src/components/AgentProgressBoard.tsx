import type { AgentProgressBoardProps } from "@/types/ui";
import { DEFAULT_AGENT_STATES } from "@/lib/sse/agent-stream";
import { PageErrorState } from "@/components/ui/state-panels";

function lifecyclePillState(lifecycle?: AgentProgressBoardProps["lifecycle"]) {
  if (lifecycle === "completed") {
    return "done";
  }

  if (lifecycle === "failed") {
    return "failed";
  }

  if (lifecycle === "running" || lifecycle === "connecting") {
    return "running";
  }

  return "waiting";
}

export function AgentProgressBoard({
  runId,
  initialAgents,
  agents,
  lifecycle = "idle",
  eventCount = 0,
  latestError,
}: AgentProgressBoardProps) {
  const visibleAgents = agents ?? initialAgents ?? DEFAULT_AGENT_STATES;
  const pillState = lifecyclePillState(lifecycle);

  return (
    <section className="or-card or-card--glow" aria-label="Agent progress board">
      <div className="or-panel-header">
        <div>
          <h2 className="or-card-title">Agent Progress Board</h2>
          <p className="or-card-subtitle">
            Real-time multi-agent run state (SSE-ready UI). Run ID:{" "}
            <span className="or-mono">{runId}</span>
          </p>
        </div>
        <span className="or-pill or-mono" data-state={pillState}>
          {lifecycle}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="or-pill or-mono" data-state="waiting">
          run: {runId}
        </span>
        <span className="or-pill or-mono" data-state="waiting">
          events: {eventCount}
        </span>
      </div>

      {latestError ? (
        <PageErrorState className="mb-3" title="Stream Error" message={latestError} />
      ) : null}

      <div className="or-status-grid">
        {visibleAgents.map((agent) => (
          <div className="or-agent-tile" key={agent.name} data-testid={`agent-${agent.name}`}>
            <div className="or-agent-name">{agent.name}</div>
            <div className="or-agent-state">{agent.status}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="or-pill" data-state={agent.status}>
                {agent.status}
              </span>
              {agent.updatedAt ? <span className="or-pill or-mono">{agent.updatedAt}</span> : null}
            </div>
            {agent.message ? <p className="mt-2 text-xs text-slate-600">{agent.message}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
