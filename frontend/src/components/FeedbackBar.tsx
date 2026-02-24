"use client";

import { useState } from "react";
import { Button, Card, Input, Space, Tag, Typography } from "antd";

import type { FeedbackBarProps, FeedbackSubmitPayload } from "@/types/ui";

export function FeedbackBar({ onSubmit, runId }: FeedbackBarProps) {
  const [rating, setRating] = useState<FeedbackSubmitPayload["rating"] | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!rating || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, notes: notes.trim() || undefined });
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card aria-label="Feedback bar" size="small">
      <div className="or-panel-header">
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Feedback
          </Typography.Title>
          <Typography.Text type="secondary">Run: {runId}</Typography.Text>
        </div>
        {rating ? (
          <Tag color={rating === "good" ? "success" : "error"} style={{ marginInlineEnd: 0 }}>
            {rating}
          </Tag>
        ) : null}
      </div>

      <Space wrap>
        <Button
          onClick={() => setRating("good")}
          aria-pressed={rating === "good"}
          type={rating === "good" ? "primary" : "default"}
          disabled={isSubmitting}
        >
          Good
        </Button>
        <Button
          onClick={() => setRating("bad")}
          aria-pressed={rating === "bad"}
          danger={rating === "bad"}
          disabled={isSubmitting}
        >
          Bad
        </Button>
      </Space>

      <div className="mt-3">
        <Input.TextArea
          placeholder="Optional notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isSubmitting}
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </div>

      <div className="mt-3">
        <Button
          type="primary"
          disabled={!rating || isSubmitting}
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Submit Feedback
        </Button>
      </div>
    </Card>
  );
}
