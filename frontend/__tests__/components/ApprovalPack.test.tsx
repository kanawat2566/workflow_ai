import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApprovalPack } from "@/components/ApprovalPack";
import { createMockApprovalPack } from "@/lib/mock/approval-pack";

vi.mock("@git-diff-view/react", () => ({
  DiffView: () => <div data-testid="mock-diff-view">Mock Diff View</div>,
  DiffModeEnum: { Unified: "unified", Split: "split" },
}));

vi.mock("react-complex-tree", () => ({
  StaticTreeDataProvider: class MockProvider {
    constructor(public items: unknown) {}
  },
  UncontrolledTreeEnvironment: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-tree-env">{children}</div>
  ),
  Tree: () => <div data-testid="mock-tree">Mock Tree</div>,
}));

describe("ApprovalPack", () => {
  it("should display quality score in approval pack", () => {
    const data = createMockApprovalPack("run-approval-1");

    render(<ApprovalPack data={data} />);

    expect(screen.getByText("87/100")).toBeInTheDocument();
    expect(screen.getByText(/pending_approval/i)).toBeInTheDocument();
  });

  it("should render artifacts and diff viewer", () => {
    const data = createMockApprovalPack("run-approval-2");

    render(<ApprovalPack data={data} />);

    expect(screen.getByTestId("approval-file-tree")).toBeInTheDocument();
    expect(screen.getByTestId("mock-tree")).toBeInTheDocument();
    expect(screen.getByTestId("approval-diff-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-diff-view")).toBeInTheDocument();
    expect(screen.getByText(/frontend\/task-list\.md/i)).toBeInTheDocument();
  });

  it("should handle missing optional fields gracefully", () => {
    const data = createMockApprovalPack("run-approval-3");
    delete data.diff;
    delete data.evaluationScore;
    delete data.evaluationIssues;
    delete data.details;

    render(<ApprovalPack data={data} />);

    expect(screen.getByText("-/100")).toBeInTheDocument();
    expect(screen.getByText(/No diff available/i)).toBeInTheDocument();
  });
});

