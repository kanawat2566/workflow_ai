"use client";

import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
  type TreeItem,
  type TreeItemIndex,
} from "react-complex-tree";

import type { ApprovalArtifact, ApprovalPack as ApprovalPackData } from "@/lib/contracts/approval-pack";
import type { ApprovalPackProps } from "@/types/ui";
import { PageEmptyState, SectionShell } from "@/components/ui/state-panels";

type FileTreeData = {
  items: Record<TreeItemIndex, TreeItem<string>>;
  rootItem: string;
};

function segmentName(segment: string): string {
  return segment.trim() || "item";
}

function buildArtifactTree(artifacts: ApprovalArtifact[]): FileTreeData {
  const items: Record<TreeItemIndex, TreeItem<string>> = {
    root: {
      index: "root",
      isFolder: true,
      children: [],
      data: "Artifacts",
    },
  };

  const folderChildren = new Map<string, string[]>();

  for (const artifact of artifacts) {
    const pathParts = artifact.path.split("/").filter(Boolean);
    let parentId = "root";
    let currentPath = "";

    pathParts.forEach((part, partIndex) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = partIndex === pathParts.length - 1;
      const itemId = currentPath;

      if (!items[itemId]) {
        items[itemId] = {
          index: itemId,
          isFolder: !isLeaf,
          children: isLeaf ? undefined : [],
          data: isLeaf ? `${segmentName(part)} (${artifact.type})` : segmentName(part),
        };
      }

      const siblings = folderChildren.get(parentId) ?? [];
      if (!siblings.includes(itemId)) {
        siblings.push(itemId);
        folderChildren.set(parentId, siblings);
      }

      parentId = itemId;
    });
  }

  for (const [id, children] of folderChildren.entries()) {
    if (items[id]) {
      items[id] = { ...items[id], children, isFolder: true };
    }
  }

  return { items, rootItem: "root" };
}

function statusPillState(status: ApprovalPackData["status"]) {
  if (status === "approved" || status === "revised") {
    return "done";
  }

  if (status === "rejected") {
    return "failed";
  }

  return "running";
}

export function ApprovalPack({ data }: ApprovalPackProps) {
  const tree = buildArtifactTree(data.artifacts);

  return (
    <section className="or-grid" aria-label="Approval pack">
      <div className="or-card or-card--glow">
        <div className="or-panel-header">
          <div>
            <h2 className="or-card-title">Approval Pack Summary</h2>
            <p className="or-card-subtitle">{data.useCase}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="or-pill" data-state={statusPillState(data.status)}>
              {data.status}
            </span>
            <span className="or-pill or-mono" data-state="waiting">
              {data.runId}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700">{data.summary}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="or-card">
            <div className="or-card-subtitle">Quality Score</div>
            <div className="or-metric">
              <span className="or-metric-value">{data.evaluationScore ?? "-"}/100</span>
              <span className="or-metric-label">score</span>
            </div>
          </div>
          <div className="or-card">
            <div className="or-card-subtitle">Artifacts</div>
            <div className="or-metric">
              <span className="or-metric-value">{data.artifacts.length}</span>
              <span className="or-metric-label">items</span>
            </div>
          </div>
          <div className="or-card">
            <div className="or-card-subtitle">Created</div>
            <div className="or-metric">
              <span className="or-metric-value or-mono text-sm">
                {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
              </span>
              <span className="or-metric-label">timestamp</span>
            </div>
          </div>
        </div>

        {data.details ? (
          <div className="mt-4 or-card">
            <div className="or-card-title">Details</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{data.details}</pre>
          </div>
        ) : null}

        {data.evaluationIssues?.length ? (
          <div className="mt-4 or-card">
            <div className="or-card-title">Evaluation Issues</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {data.evaluationIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="or-grid or-grid-2">
        <div className="or-card">
          <div className="or-card-title">Artifacts</div>
          <div className="mb-3 grid gap-2">
            {data.artifacts.map((artifact) => (
              <div className="rounded-lg border border-black/10 bg-slate-50 p-3" key={`${artifact.type}:${artifact.path}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{artifact.name}</span>
                  <span className="or-pill">{artifact.type}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600 or-mono">{artifact.path}</div>
                {artifact.previewUrl ? (
                  <a
                    className="mt-2 inline-block text-xs text-blue-600 underline underline-offset-2"
                    href={artifact.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="or-divider" />

          <div className="or-card-title">File Tree</div>
          <div className="rounded-lg border border-black/10 bg-slate-50 p-2 text-sm" data-testid="approval-file-tree">
            <UncontrolledTreeEnvironment
              dataProvider={new StaticTreeDataProvider(tree.items, (item, data) => ({ ...item, data }))}
              getItemTitle={(item) => item.data}
              viewState={{ "approval-tree": { expandedItems: ["root", "frontend", "frontend/src"] } }}
              canDragAndDrop={false}
              canReorderItems={false}
              disableMultiselect
            >
              <Tree treeId="approval-tree" rootItem={tree.rootItem} treeLabel="Approval artifacts tree" />
            </UncontrolledTreeEnvironment>
          </div>
        </div>

        <SectionShell title="Diff Viewer">
          {data.diff ? (
            <div className="overflow-auto rounded-lg border border-black/10 bg-white p-2" data-testid="approval-diff-view">
              <DiffView
                data={{
                  oldFile: { fileName: "before.txt", content: "" },
                  newFile: { fileName: "after.txt", content: "generated content" },
                  hunks: data.diff.split("\n"),
                }}
                diffViewMode={DiffModeEnum.Unified}
                diffViewTheme="light"
                diffViewHighlight={false}
                diffViewWrap
              />
            </div>
          ) : (
            <PageEmptyState title="No diff available" message="Unified diff was not provided in this approval pack." />
          )}
        </SectionShell>
      </div>
    </section>
  );
}
