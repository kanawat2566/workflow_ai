"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { UseAgentStreamResult } from "@/types/ui";
import {
  createInitialAgentStreamState,
  parseSSEMessageData,
  reduceAgentStreamEvent,
  type AgentStreamState,
} from "@/lib/sse/agent-stream";

type UseAgentStreamOptions = {
  autoConnect?: boolean;
  eventSourceFactory?: (url: string) => EventSource;
};

function createEventSource(url: string): EventSource {
  return new EventSource(url);
}

export function useAgentStream(
  runId: string,
  options: UseAgentStreamOptions = {},
): UseAgentStreamResult {
  const { autoConnect = true, eventSourceFactory = createEventSource } = options;
  const [state, setState] = useState<AgentStreamState>(() => createInitialAgentStreamState(runId));
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setState(createInitialAgentStreamState(runId));
  }, [runId]);

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
    setState((current) => ({ ...current, lifecycle: "disconnected" }));
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setState((current) => ({ ...current, lifecycle: "connecting", latestError: undefined }));

    const source = eventSourceFactory(`/api/stream/${runId}`);
    sourceRef.current = source;

    source.onopen = () => {
      setState((current) => ({ ...current, lifecycle: "running" }));
    };

    source.onmessage = (message) => {
      const parsedEvent = parseSSEMessageData(message.data);

      if (!parsedEvent || parsedEvent.runId !== runId) {
        return;
      }

      setState((current) => reduceAgentStreamEvent(current, parsedEvent));
    };

    source.onerror = () => {
      setState((current) => ({
        ...current,
        lifecycle: current.lifecycle === "completed" ? current.lifecycle : "failed",
        latestError: current.latestError ?? "SSE connection error",
      }));
    };
  }, [disconnect, eventSourceFactory, runId]);

  useEffect(() => {
    if (!autoConnect || !runId) {
      return undefined;
    }

    reconnect();
    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [autoConnect, reconnect, runId]);

  return {
    lifecycle: state.lifecycle,
    agents: state.agents,
    events: state.events,
    tokens: state.tokens,
    latestError: state.latestError,
    latestApprovalUrl: state.latestApprovalUrl,
    reconnect,
    disconnect,
  };
}

