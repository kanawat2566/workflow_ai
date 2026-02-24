import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AgentProgressBoard } from "@/components/AgentProgressBoard";
import type { AgentState } from "@/lib/sse/agent-stream";

function buildAgents(overrides: Partial<Record<AgentState["name"], Partial<AgentState>>> = {}) {
  const names: AgentState["name"][] = ["lead", "ba", "architect", "dev"];

  return names.map((name) => ({
    name,
    status: "waiting" as const,
    ...overrides[name],
  }));
}

describe("AgentProgressBoard", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render all agents as waiting initially", () => {
    render(<AgentProgressBoard runId="run-1" initialAgents={buildAgents()} />);

    expect(screen.getByText(/Agent Progress Board/i)).toBeInTheDocument();
    expect(screen.getByText(/run: run-1/i)).toBeInTheDocument();

    const devTile = screen.getByTestId("agent-dev");
    expect(within(devTile).getByText("waiting", { selector: ".or-agent-state" })).toBeInTheDocument();
  });

  it("should update agent status when SSE data is provided via props", () => {
    const agents = buildAgents({
      dev: { status: "running", message: "Implementing UI" },
      lead: { status: "done" },
    });

    render(<AgentProgressBoard runId="run-2" agents={agents} lifecycle="running" eventCount={3} />);

    const devTile = screen.getByTestId("agent-dev");
    expect(within(devTile).getByText("running", { selector: ".or-agent-state" })).toBeInTheDocument();
    expect(within(devTile).getByText("Implementing UI")).toBeInTheDocument();
    expect(screen.getByText(/events: 3/i)).toBeInTheDocument();
  });

  it("should show completion state when all agents are done", () => {
    const agents = buildAgents({
      lead: { status: "done" },
      ba: { status: "done" },
      architect: { status: "done" },
      dev: { status: "done" },
    });

    render(<AgentProgressBoard runId="run-3" agents={agents} lifecycle="completed" />);

    expect(screen.getByText("completed")).toBeInTheDocument();
    const leadTile = screen.getByTestId("agent-lead");
    expect(within(leadTile).getByText("done", { selector: ".or-agent-state" })).toBeInTheDocument();
  });
});
