import { describe, expect, it } from "vitest";

import { createInitialAgentStreamState, reduceAgentStreamEvent } from "@/lib/sse/agent-stream";

describe("agent-stream reducer", () => {
  it("should mark run as failed and store error message on run_failed", () => {
    const initial = createInitialAgentStreamState("run-fail");

    const next = reduceAgentStreamEvent(initial, {
      runId: "run-fail",
      event: "run_failed",
      data: { error: "Gateway timeout" },
    });

    expect(next.lifecycle).toBe("failed");
    expect(next.latestError).toBe("Gateway timeout");
  });

  it("should keep lifecycle completed when error callback happens later in hook reducer output path", () => {
    const initial = createInitialAgentStreamState("run-complete");
    const completed = reduceAgentStreamEvent(initial, {
      runId: "run-complete",
      event: "run_completed",
      data: {},
    });

    expect(completed.lifecycle).toBe("completed");
  });

  it("should store approval url when approval_required arrives", () => {
    const initial = createInitialAgentStreamState("run-approval");

    const next = reduceAgentStreamEvent(initial, {
      runId: "run-approval",
      event: "approval_required",
      data: {
        approvalPack: {
          runId: "run-approval",
          approvalUrl: "/approval/run-approval",
        },
      },
    });

    expect(next.latestApprovalUrl).toBe("/approval/run-approval");
  });
});
