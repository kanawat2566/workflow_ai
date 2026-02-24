"use client";

import { useState } from "react";

import { AgentProgressBoard } from "@/components/AgentProgressBoard";
import { PageErrorState, SectionShell } from "@/components/ui/state-panels";
import { useAgentStream } from "@/hooks/useAgentStream";

export function MonitorStreamPanel() {
  const [draftRunId, setDraftRunId] = useState("demo-run");
  const [activeRunId, setActiveRunId] = useState("demo-run");
  const stream = useAgentStream(activeRunId);

  return (
    <div className="or-grid">
      <section className="or-card">
        <div className="or-panel-header">
          <div>
            <h1 className="or-card-title">Multi-Agent Monitor</h1>
            <p className="or-card-subtitle">SSE monitor scaffold powered by `useAgentStream`.</p>
          </div>
          <span
            className="or-pill or-mono"
            data-state={stream.lifecycle === "failed" ? "failed" : "running"}
          >
            {stream.lifecycle}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="or-input or-mono"
            value={draftRunId}
            aria-label="Run ID"
            onChange={(event) => setDraftRunId(event.target.value)}
            placeholder="Enter run ID"
          />
          <button
            className="or-btn or-btn-primary"
            type="button"
            onClick={() => setActiveRunId(draftRunId.trim() || "demo-run")}
          >
            Use Run ID
          </button>
          <button className="or-btn" type="button" onClick={stream.reconnect}>
            Reconnect
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="or-pill or-mono" data-state="waiting">
            active: {activeRunId}
          </span>
          <span className="or-pill or-mono" data-state="waiting">
            events: {stream.events.length}
          </span>
          {stream.latestApprovalUrl ? (
            <span className="or-pill or-mono" data-state="done">
              approval ready
            </span>
          ) : null}
        </div>

        {stream.latestError ? (
          <PageErrorState className="mt-3" title="Connection issue" message={stream.latestError} />
        ) : null}
      </section>

      <AgentProgressBoard
        runId={activeRunId}
        agents={stream.agents}
        lifecycle={stream.lifecycle}
        eventCount={stream.events.length}
        latestError={stream.latestError}
      />

      <SectionShell title="Token Stream (Preview)">
        <pre className="or-mono whitespace-pre-wrap text-xs text-slate-700">
          {stream.tokens || "<waiting for stream_token events>"}
        </pre>
      </SectionShell>
    </div>
  );
}
