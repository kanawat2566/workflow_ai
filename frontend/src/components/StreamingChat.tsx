"use client";

import { useId, useState } from "react";

import { useAgentStream } from "@/hooks/useAgentStream";
import type { StreamingChatProps } from "@/types/ui";
import { PageEmptyState, PageErrorState, SectionShell } from "@/components/ui/state-panels";

function createLocalRunId() {
  return `run-${Date.now()}`;
}

export function StreamingChat({ runId, onRunCreated }: StreamingChatProps) {
  const [draftRunId, setDraftRunId] = useState(runId ?? "demo-chat-run");
  const [activeRunId, setActiveRunId] = useState(runId ?? "demo-chat-run");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const fileInputId = useId();
  const stream = useAgentStream(activeRunId);

  function handleStartNewRun() {
    const nextRunId = createLocalRunId();
    setDraftRunId(nextRunId);
    setActiveRunId(nextRunId);
    onRunCreated?.(nextRunId);
  }

  return (
    <section className="or-grid" aria-label="Streaming chat">
      <div className="or-card or-card--glow">
        <div className="or-panel-header">
          <div>
            <h1 className="or-card-title">Streaming Chat</h1>
            <p className="or-card-subtitle">Token streaming preview via SSE proxy and `useAgentStream`.</p>
          </div>
          <span
            className="or-pill or-mono"
            data-state={stream.lifecycle === "failed" ? "failed" : stream.lifecycle === "completed" ? "done" : "running"}
          >
            {stream.lifecycle}
          </span>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--line-soft)", background: "var(--bg-3)" }}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg-0)" }}>
              Display / Transcript
            </h2>
            <span className="or-pill or-mono" data-state="waiting">
              chars: {stream.tokens.length}
            </span>
          </div>
          <pre className="or-mono min-h-[220px] whitespace-pre-wrap text-sm" style={{ color: "var(--fg-1)" }} data-testid="chat-transcript">
            {stream.tokens || "<waiting for stream_token events>"}
          </pre>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="or-input or-mono"
            aria-label="Chat Run ID"
            value={draftRunId}
            onChange={(event) => setDraftRunId(event.target.value)}
            placeholder="Enter chat run ID"
          />
          <button
            className="or-btn or-btn-primary"
            type="button"
            onClick={() => setActiveRunId(draftRunId.trim() || "demo-chat-run")}
          >
            Connect Chat
          </button>
          <button className="or-btn" type="button" onClick={handleStartNewRun}>
            New Run
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="or-pill or-mono" data-state="waiting">
            active: {activeRunId}
          </span>
          <span className="or-pill or-mono" data-state="waiting">
            events: {stream.events.length}
          </span>
          <span className="or-pill or-mono" data-state="waiting">
            agents running: {stream.agents.filter((agent) => agent.status === "running").length}
          </span>
        </div>

        {stream.latestError ? (
          <PageErrorState className="mt-3" title="Stream error" message={stream.latestError} />
        ) : null}
      </div>

      <SectionShell title="Operator Prompt" subtitle="Prompt input, attachments, and voice trigger (UI scaffold)">
        <textarea
          className="or-textarea"
          placeholder="Type a prompt for the orchestrator (UI placeholder)"
          defaultValue="Build a frontend approval page for AI agent outputs."
          aria-label="Operator prompt"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`or-btn ${isVoiceMode ? "or-btn-primary" : ""}`}
            type="button"
            aria-pressed={isVoiceMode}
            onClick={() => setIsVoiceMode((value) => !value)}
          >
            {isVoiceMode ? "Stop Speaking" : "Speak (Mic)"}
          </button>

          <label className="or-btn cursor-pointer" htmlFor={fileInputId} aria-label="Attach file">
            Attach File
          </label>
          <input
            id={fileInputId}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              const names = Array.from(event.target.files ?? []).map((file) => file.name);
              setAttachedFiles(names);
            }}
          />

          <button className="or-btn or-btn-primary" type="button" onClick={stream.reconnect}>
            Send / Reconnect
          </button>
          <button className="or-btn" type="button" onClick={stream.disconnect}>
            Disconnect
          </button>
        </div>

        {isVoiceMode ? (
          <div className="mt-3">
            <PageEmptyState
              title="Voice input (placeholder)"
              message="Mic button is wired as a UI toggle only. Speech-to-text integration is pending backend/browser handling."
            />
          </div>
        ) : null}

        {attachedFiles.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Attached files">
            {attachedFiles.map((fileName) => (
              <span className="or-pill or-mono" data-state="waiting" key={fileName}>
                {fileName}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs" style={{ color: "var(--fg-3)" }} aria-live="polite">
            No files attached
          </p>
        )}
      </SectionShell>

      <SectionShell title="Recent Events">
        {stream.events.length === 0 ? (
          <PageEmptyState title="No events yet" message="No SSE events received yet." />
        ) : (
          <ul className="space-y-2 text-sm">
            {stream.events.slice(-5).reverse().map((event, index) => (
              <li
                className="rounded-lg border p-2"
                style={{ borderColor: "var(--line-soft)", background: "var(--bg-3)" }}
                key={`${event.event}-${index}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="or-pill">{event.event}</span>
                  {event.data.agent ? <span className="or-pill or-mono">{event.data.agent}</span> : null}
                  {event.data.status ? (
                    <span className="or-pill" data-state={event.data.status}>
                      {event.data.status}
                    </span>
                  ) : null}
                </div>
                {event.data.message ? (
                  <p className="mt-2" style={{ color: "var(--fg-2)" }}>
                    {event.data.message}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionShell>
    </section>
  );
}
