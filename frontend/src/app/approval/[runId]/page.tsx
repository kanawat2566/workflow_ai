import { ApprovalPageClient } from "@/components/ApprovalPageClient";
import { createMockApprovalPack } from "@/lib/mock/approval-pack";

type ApprovalPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const { runId } = await params;
  const mockApprovalPack = createMockApprovalPack(runId);

  return (
    <ApprovalPageClient initialData={mockApprovalPack} />
  );
}
