import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function SectionShell({ title, subtitle, children, className }: SectionShellProps) {
  return (
    <section className={cn("or-card", className)}>
      <div className="or-card-title">{title}</div>
      {subtitle ? <p className="or-card-subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}

type StatePanelProps = {
  title?: string;
  message: string;
  className?: string;
};

export function PageEmptyState({ title = "No data", message, className }: StatePanelProps) {
  return (
    <div className={cn("or-empty", className)} role="status" aria-live="polite">
      <div className="text-sm font-semibold" style={{ color: "var(--fg-1)" }}>
        {title}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
        {message}
      </p>
    </div>
  );
}

export function PageErrorState({ title = "Something went wrong", message, className }: StatePanelProps) {
  return (
    <div className={cn("or-empty", className)} role="alert">
      <div className="text-sm font-semibold" style={{ color: "var(--err)" }}>
        {title}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
        {message}
      </p>
    </div>
  );
}

export function PageLoadingState({
  title = "Loading",
  message = "Please wait while data is loaded.",
  className,
}: Partial<StatePanelProps>) {
  return (
    <div className={cn("or-empty", className)} role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
        <span className="text-sm font-semibold" style={{ color: "var(--fg-1)" }}>
          {title}
        </span>
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
        {message}
      </p>
    </div>
  );
}
