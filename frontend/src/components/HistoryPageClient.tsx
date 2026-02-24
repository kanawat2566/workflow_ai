"use client";

import { Card, Tag } from "antd";

import { PageEmptyState } from "@/components/ui/state-panels";

const demoRows = [
  { runId: "run-001", useCase: "doc_generation", status: "approved", score: 91 },
  { runId: "run-002", useCase: "web_app_creation", status: "pending_approval", score: 87 },
];

export function HistoryPageClient() {
  return (
    <div className="or-grid">
      <Card>
        <div className="or-panel-header">
          <div>
            <h1 className="or-card-title">Run History</h1>
            <p className="or-card-subtitle">
              Placeholder table until history API contract is available.
            </p>
          </div>
          <Tag color="default">source: mock</Tag>
        </div>

        <table className="or-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Use Case</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {demoRows.map((row) => (
              <tr key={row.runId}>
                <td>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                    {row.runId}
                  </code>
                </td>
                <td>{row.useCase}</td>
                <td>
                  <Tag color={row.status === "approved" ? "success" : "processing"}>{row.status}</Tag>
                </td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <PageEmptyState
            title="History API pending"
            message="This table is placeholder data until the history endpoint contract is finalized."
          />
        </div>
      </Card>
    </div>
  );
}
