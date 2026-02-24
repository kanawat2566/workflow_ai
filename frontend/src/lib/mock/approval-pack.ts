import type { ApprovalPack } from "@/lib/contracts/approval-pack";

export function createMockApprovalPack(runId: string): ApprovalPack {
  return {
    runId,
    useCase: "web_app_creation",
    summary: "Generated frontend scaffold, monitor SSE flow, and approval UI placeholders.",
    details:
      "This approval pack summarizes the current implementation status for the frontend app.\n\n- Next.js scaffold created\n- SSE proxy and hook added\n- Monitor board integrated",
    artifacts: [
      { name: "Task List", type: "markdown", path: "frontend/task-list.md" },
      { name: "Monitor Panel", type: "code", path: "frontend/src/components/MonitorStreamPanel.tsx" },
      { name: "Agent Board", type: "code", path: "frontend/src/components/AgentProgressBoard.tsx" },
      {
        name: "Frontend Preview",
        type: "url",
        path: "/monitor",
        previewUrl: "http://localhost:3000/monitor",
      },
    ],
    diff: [
      "@@ -0,0 +1,4 @@",
      "+export function hello() {",
      '+  return "world";',
      "+}",
      "",
    ].join("\n"),
    evaluationScore: 87,
    evaluationIssues: [
      "Approval actions backend contract not finalized",
      "History API is still a placeholder",
    ],
    status: "pending_approval",
    createdAt: new Date().toISOString(),
  };
}

