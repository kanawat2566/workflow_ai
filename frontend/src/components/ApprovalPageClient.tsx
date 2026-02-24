"use client";

import { useState } from "react";

import { ApprovalButtons } from "@/components/ApprovalButtons";
import { ApprovalPack } from "@/components/ApprovalPack";
import { FeedbackBar } from "@/components/FeedbackBar";
import type { ApprovalPack as ApprovalPackData } from "@/lib/contracts/approval-pack";

type ApprovalPageClientProps = {
  initialData: ApprovalPackData;
};

export function ApprovalPageClient({ initialData }: ApprovalPageClientProps) {
  const [approvalData, setApprovalData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  async function handleApprove(runId: string) {
    setIsSubmitting(true);
    try {
      setApprovalData((current) => ({
        ...current,
        runId,
        status: "approved",
        approvedAt: new Date().toISOString(),
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject(runId: string, comment: string) {
    setIsSubmitting(true);
    try {
      setApprovalData((current) => ({
        ...current,
        runId,
        status: "rejected",
        rejectionComment: comment,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFeedbackSubmit(payload: { rating: "good" | "bad"; notes?: string }) {
    setFeedbackMessage(
      `Feedback received: ${payload.rating}${payload.notes ? ` (${payload.notes})` : ""}`,
    );
  }

  return (
    <div className="or-grid">
      <ApprovalPack data={approvalData} />

      <div className="or-grid or-grid-2">
        <ApprovalButtons
          runId={approvalData.runId}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={isSubmitting}
        />
        <FeedbackBar runId={approvalData.runId} onSubmit={handleFeedbackSubmit} />
      </div>

      {approvalData.rejectionComment ? (
        <div className="or-card">
          <div className="or-card-title">Latest Rejection Comment</div>
          <p className="text-sm text-slate-700">{approvalData.rejectionComment}</p>
        </div>
      ) : null}

      {feedbackMessage ? (
        <div className="or-card">
          <div className="or-card-title">Feedback Status</div>
          <p className="text-sm text-slate-700">{feedbackMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
