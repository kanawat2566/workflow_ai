"use client";

import { useState } from "react";
import { Button, Card, Input, Space, Typography } from "antd";

import type { ApprovalButtonsProps } from "@/types/ui";

export function ApprovalButtons({
  runId,
  onApprove,
  onReject,
  isSubmitting = false,
}: ApprovalButtonsProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [comment, setComment] = useState("");

  async function handleApprove() {
    await onApprove(runId);
  }

  async function handleReject() {
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }

    await onReject(runId, trimmed);
    setIsRejectOpen(false);
    setComment("");
  }

  return (
    <Card aria-label="Approval actions" size="small" title="Approval Actions">
      <Space orientation="vertical" style={{ width: "100%" }} size={12}>
        <Button type="primary" onClick={handleApprove} loading={isSubmitting} disabled={isSubmitting} block>
          Approve
        </Button>

        <Button danger onClick={() => setIsRejectOpen((open) => !open)} disabled={isSubmitting} block>
          {isRejectOpen ? "Cancel Reject" : "Reject with Comment"}
        </Button>

        {isRejectOpen ? (
          <Card size="small" styles={{ body: { background: "#fafafa" } }}>
            <label className="mb-2 block" htmlFor="reject-comment">
              <Typography.Text>Rejection comment</Typography.Text>
            </label>
            <Input.TextArea
              id="reject-comment"
              placeholder="Explain what should be revised"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isSubmitting}
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
            <div className="mt-3">
              <Button danger onClick={handleReject} disabled={isSubmitting || !comment.trim()}>
                Confirm Reject
              </Button>
            </div>
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}
