import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApprovalButtons } from "@/components/ApprovalButtons";

describe("ApprovalButtons", () => {
  it("should call approve API when approve button clicked", async () => {
    const mockApprove = vi.fn();
    const mockReject = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalButtons runId="r1" onApprove={mockApprove} onReject={mockReject} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));

    expect(mockApprove).toHaveBeenCalledWith("r1");
  });

  it("should call reject callback with comment when confirmed", async () => {
    const mockApprove = vi.fn();
    const mockReject = vi.fn();
    const user = userEvent.setup();

    render(<ApprovalButtons runId="r2" onApprove={mockApprove} onReject={mockReject} />);

    await user.click(screen.getByRole("button", { name: /reject with comment/i }));
    await user.type(screen.getByLabelText(/rejection comment/i), "Need better diff summary");
    await user.click(screen.getByRole("button", { name: /confirm reject/i }));

    expect(mockReject).toHaveBeenCalledWith("r2", "Need better diff summary");
  });
});

