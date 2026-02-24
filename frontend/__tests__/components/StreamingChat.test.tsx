import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StreamingChat } from "@/components/StreamingChat";

const reconnectMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock("@/hooks/useAgentStream", () => ({
  useAgentStream: () => ({
    lifecycle: "running",
    agents: [
      { name: "lead", status: "running" },
      { name: "dev", status: "waiting" },
    ],
    events: [
      {
        runId: "demo-chat-run",
        event: "agent_update",
        data: { agent: "lead", status: "running", message: "Planning..." },
      },
    ],
    tokens: "Hello streaming world",
    latestError: undefined,
    latestApprovalUrl: undefined,
    reconnect: reconnectMock,
    disconnect: disconnectMock,
  }),
}));

describe("StreamingChat", () => {
  it("should render streaming transcript and recent events", () => {
    render(<StreamingChat />);

    expect(screen.getByText(/Streaming Chat/i)).toBeInTheDocument();
    expect(screen.getByTestId("chat-transcript")).toHaveTextContent("Hello streaming world");
    expect(screen.getByText(/Planning\.\.\./i)).toBeInTheDocument();
  });

  it("should call reconnect and disconnect actions", async () => {
    const user = userEvent.setup();
    render(<StreamingChat />);

    await user.click(screen.getByRole("button", { name: /send \/ reconnect/i }));
    await user.click(screen.getByRole("button", { name: /disconnect/i }));

    expect(reconnectMock).toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
