"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConfigProvider, Layout, Menu, Space, Switch } from "antd";

import { type AppThemeMode, getAntThemeConfig } from "@/lib/antd-theme";

const THEME_STORAGE_KEY = "workflow-ai-theme-mode";

type AppShellProps = {
  children: React.ReactNode;
};

function resolveInitialMode(): AppThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppShell({ children }: AppShellProps) {
  const [mode, setMode] = useState<AppThemeMode>(resolveInitialMode);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = mode;
    document.body.dataset.theme = mode;
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  return (
    <ConfigProvider theme={getAntThemeConfig(mode)}>
      <Layout style={{ minHeight: "100vh", background: "var(--bg-0)" }}>
        <div className="or-page">
          <Layout
            className="or-fade-up"
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid var(--line-soft)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "var(--shadow-elev)",
            }}
          >
            <div
              style={{
                background: "var(--header-bg)",
                borderBottom: "1px solid var(--line-soft)",
                padding: "10px 16px",
                height: "auto",
                lineHeight: 1.2,
              }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="or-brand-dot" aria-hidden="true" />
                  <span className="font-semibold text-[var(--fg-0)]">AI Agent Platform</span>
                </div>

                <nav aria-label="Primary navigation" className="md:min-w-0 md:flex-1">
                  <Menu
                    mode="horizontal"
                    selectable={false}
                    style={{
                      borderBottom: "none",
                      background: "transparent",
                      minWidth: 0,
                      width: "100%",
                      justifyContent: "flex-end",
                    }}
                    items={[
                      { key: "chat", label: <Link href="/">Chat</Link> },
                      { key: "monitor", label: <Link href="/monitor">Monitor</Link> },
                      { key: "history", label: <Link href="/history">History</Link> },
                      { key: "approval", label: <Link href="/approval/demo-run">Approval</Link> },
                    ]}
                  />
                </nav>

                <Space size={8} align="center" className="self-start md:self-auto">
                  <span style={{ color: "var(--fg-2)", fontSize: 12 }}>
                    {mode === "dark" ? "Dark" : "Light"}
                  </span>
                  <Switch
                    aria-label="Toggle dark mode"
                    checked={mode === "dark"}
                    onChange={(checked) => setMode(checked ? "dark" : "light")}
                  />
                </Space>
              </div>
            </div>
            <div style={{ padding: 16 }}>{children}</div>
          </Layout>
        </div>
      </Layout>
    </ConfigProvider>
  );
}
