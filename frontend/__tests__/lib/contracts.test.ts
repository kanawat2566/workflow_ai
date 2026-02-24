import { describe, expect, it } from "vitest";

import { isApprovalPack } from "@/lib/contracts/approval-pack";
import { isSSEEvent, parseSSEEvent } from "@/lib/contracts/sse";
import { createMockApprovalPack } from "@/lib/mock/approval-pack";

describe("contracts", () => {
  describe("approval-pack guard", () => {
    it("should accept a valid approval pack payload", () => {
      expect(isApprovalPack(createMockApprovalPack("run-guard-1"))).toBe(true);
    });

    it("should reject invalid artifact types and missing required fields", () => {
      const invalid = {
        ...createMockApprovalPack("run-guard-2"),
        artifacts: [{ name: "x", type: "nope", path: "x" }],
      };
      const missingRequired = { runId: "x" };

      expect(isApprovalPack(invalid)).toBe(false);
      expect(isApprovalPack(missingRequired)).toBe(false);
    });
  });

  describe("sse guard", () => {
    it("should parse valid SSE events", () => {
      const payload = {
        runId: "run-1",
        event: "agent_update",
        data: {
          agent: "dev",
          status: "running",
          message: "Working",
          timestamp: new Date().toISOString(),
        },
      };

      expect(isSSEEvent(payload)).toBe(true);
      expect(parseSSEEvent(payload)).toEqual(payload);
    });

    it("should reject invalid event names and malformed data", () => {
      const invalidEvent = {
        runId: "run-1",
        event: "unknown_event",
        data: {},
      };
      const invalidData = {
        runId: "run-1",
        event: "agent_update",
        data: { agent: "not-an-agent", status: "running" },
      };

      expect(isSSEEvent(invalidEvent)).toBe(false);
      expect(isSSEEvent(invalidData)).toBe(false);
      expect(parseSSEEvent(invalidEvent)).toBeNull();
    });

    it("should allow approval pack refs and full approval packs in approval_required", () => {
      const refEvent = {
        runId: "run-2",
        event: "approval_required",
        data: {
          approvalPack: {
            runId: "run-2",
            approvalUrl: "/approval/run-2",
          },
        },
      };
      const fullPackEvent = {
        runId: "run-3",
        event: "approval_required",
        data: {
          approvalPack: createMockApprovalPack("run-3"),
        },
      };

      expect(isSSEEvent(refEvent)).toBe(true);
      expect(isSSEEvent(fullPackEvent)).toBe(true);
    });
  });
});

