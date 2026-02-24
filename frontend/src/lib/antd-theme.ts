import type { ThemeConfig } from "antd";
import { theme as antTheme } from "antd";

export type AppThemeMode = "light" | "dark";

export function getAntThemeConfig(mode: AppThemeMode): ThemeConfig {
  const isDark = mode === "dark";

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
      borderRadius: 8,
      colorBgLayout: isDark ? "#0f1115" : "#f5f7fb",
      colorBgContainer: isDark ? "#171a21" : "#ffffff",
      colorBorderSecondary: isDark ? "rgba(255,255,255,0.10)" : "rgba(5,5,5,0.08)",
      fontFamily:
        '"Space Grotesk", "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontFamilyCode:
        '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    components: {
      Layout: {
        headerBg: isDark ? "rgba(23,26,33,0.9)" : "rgba(255,255,255,0.95)",
        bodyBg: isDark ? "#0f1115" : "#f5f7fb",
      },
      Card: {
        borderRadiusLG: 8,
      },
      Button: {
        borderRadius: 8,
        controlHeight: 36,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 36,
      },
    },
  };
}
