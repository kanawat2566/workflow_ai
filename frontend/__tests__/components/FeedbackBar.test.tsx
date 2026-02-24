import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FeedbackBar } from "@/components/FeedbackBar";

describe("FeedbackBar", () => {
  it("should select rating and submit notes", async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<FeedbackBar runId="run-1" onSubmit={mockSubmit} />);

    await user.click(screen.getByRole("button", { name: /good/i }));
    await user.type(screen.getByPlaceholderText(/optional notes/i), "Looks good overall");
    await user.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      rating: "good",
      notes: "Looks good overall",
    });
  });

  it("should disable submit until a rating is selected", () => {
    const mockSubmit = vi.fn();

    render(<FeedbackBar runId="run-2" onSubmit={mockSubmit} />);

    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
  });
});
