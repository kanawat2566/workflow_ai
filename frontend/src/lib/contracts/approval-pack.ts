import { isOptionalNumber, isOptionalString, isRecord, isString } from "./guards";

export const APPROVAL_ARTIFACT_TYPES = ["markdown", "code", "diff", "zip", "url"] as const;
export const APPROVAL_USE_CASES = [
  "doc_generation",
  "web_app_creation",
  "bot_team_spec",
  "media_generation",
] as const;
export const APPROVAL_STATUSES = ["pending_approval", "approved", "rejected", "revised"] as const;

export type ApprovalArtifactType = (typeof APPROVAL_ARTIFACT_TYPES)[number];
export type ApprovalUseCase = (typeof APPROVAL_USE_CASES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ApprovalArtifact = {
  name: string;
  type: ApprovalArtifactType;
  path: string;
  diffUrl?: string;
  previewUrl?: string;
};

export type ApprovalPack = {
  runId: string;
  useCase: ApprovalUseCase;
  summary: string;
  details?: string;
  artifacts: ApprovalArtifact[];
  diff?: string;
  evaluationScore?: number;
  evaluationIssues?: string[];
  status: ApprovalStatus;
  createdAt?: string;
  approvedAt?: string;
  rejectionComment?: string;
  prUrl?: string;
  commitHash?: string;
};

function isApprovalArtifactType(value: unknown): value is ApprovalArtifactType {
  return typeof value === "string" && APPROVAL_ARTIFACT_TYPES.includes(value as ApprovalArtifactType);
}

function isApprovalUseCase(value: unknown): value is ApprovalUseCase {
  return typeof value === "string" && APPROVAL_USE_CASES.includes(value as ApprovalUseCase);
}

function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return typeof value === "string" && APPROVAL_STATUSES.includes(value as ApprovalStatus);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isApprovalArtifact(value: unknown): value is ApprovalArtifact {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.name) &&
    isApprovalArtifactType(value.type) &&
    isString(value.path) &&
    isOptionalString(value.diffUrl) &&
    isOptionalString(value.previewUrl)
  );
}

export function isApprovalPack(value: unknown): value is ApprovalPack {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.runId) &&
    isApprovalUseCase(value.useCase) &&
    isString(value.summary) &&
    isOptionalString(value.details) &&
    Array.isArray(value.artifacts) &&
    value.artifacts.every(isApprovalArtifact) &&
    isOptionalString(value.diff) &&
    isOptionalNumber(value.evaluationScore) &&
    (value.evaluationIssues === undefined || isStringArray(value.evaluationIssues)) &&
    isApprovalStatus(value.status) &&
    isOptionalString(value.createdAt) &&
    isOptionalString(value.approvedAt) &&
    isOptionalString(value.rejectionComment) &&
    isOptionalString(value.prUrl) &&
    isOptionalString(value.commitHash)
  );
}

