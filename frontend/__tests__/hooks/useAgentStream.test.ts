import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useAgentStream } from "@/hooks/useAgentStream";

type MessageHandler = ((event: MessageEvent<string>) => void) | null;
type VoidHandler = (() => void) | null;

class MockEventSource {
  public onopen: VoidHandler = null;
  public onerror: VoidHandler = null;
  public onmessage: MessageHandler = null;
  public isClosed = false;

  constructor(public readonly url: string) {}

  close() {
    this.isClosed = true;
  }

  emitOpen() {
    this.onopen?.();
  }

  emitError() {
    this.onerror?.();
  }

  emitMessage(data: unknown) {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.onmessage?.({ data: payload } as MessageEvent<string>);
  }
}

const createdSources: MockEventSource[] = [];

function mockFactory(url: string): EventSource {
  const source = new MockEventSource(url);
  createdSources.push(source);
  return source as unknown as EventSource;
}

afterEach(() => {
  createdSources.length = 0;
});

describe("useAgentStream", () => {
  it("should parse SSE event and update agent state", () => {
    const { result } = renderHook(() =>
      useAgentStream("run-1", { eventSourceFactory: mockFactory }),
    );

    const source = createdSources[0];

    act(() => {
      source.emitOpen();
      source.emitMessage({
        runId: "run-1",
        event: "agent_update",
        data: {
          agent: "dev",
          status: "running",
          message: "Implementing UI",
        },
      });
    });

    const devAgent = result.current.agents.find((agent) => agent.name === "dev");
    expect(result.current.lifecycle).toBe("running");
    expect(devAgent?.status).toBe("running");
    expect(devAgent?.message).toBe("Implementing UI");
  });

  it("should append streaming tokens when stream_token events arrive", () => {
    const { result } = renderHook(() =>
      useAgentStream("run-2", { eventSourceFactory: mockFactory }),
    );

    const source = createdSources[0];

    act(() => {
      source.emitOpen();
      source.emitMessage({
        runId: "run-2",
        event: "stream_token",
        data: { token: "Hello " },
      });
      source.emitMessage({
        runId: "run-2",
        event: "stream_token",
        data: { token: "world" },
      });
    });

    expect(result.current.tokens).toBe("Hello world");
  });

  it("should close EventSource on unmount to prevent memory leak", () => {
    const { unmount } = renderHook(() =>
      useAgentStream("run-3", { eventSourceFactory: mockFactory }),
    );

    const source = createdSources[0];
    expect(source.isClosed).toBe(false);

    unmount();

    expect(source.isClosed).toBe(true);
  });

  it("should ignore malformed payloads without crashing", () => {
    const { result } = renderHook(() =>
      useAgentStream("run-4", { eventSourceFactory: mockFactory }),
    );

    const source = createdSources[0];

    act(() => {
      source.emitOpen();
      source.emitMessage("{invalid json");
      source.emitMessage({
        nope: true,
      });
    });

    expect(result.current.events).toHaveLength(0);
    expect(result.current.lifecycle).toBe("running");
  });
});
