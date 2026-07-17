import type { ThemeMode } from "../store/useAppStore";

/**
 * The page and accent colour of every theme, mirrored from editorial.css —
 * the single JS-side source for anything that can't read CSS variables:
 * the picker's swatches and the GL stage's background/fog.
 */
export const THEME_META: Record<ThemeMode, { bg: string; accent: string }> = {
  porcelain: { bg: "#f4f6f8", accent: "#4a9fd8" },
  ink: { bg: "#0f1217", accent: "#5fb2e8" },
  sapphire: { bg: "#0a0f26", accent: "#5582ff" },
  amethyst: { bg: "#16101f", accent: "#b57fd6" },
  emerald: { bg: "#06120a", accent: "#69cc99" },
  ruby: { bg: "#170a0c", accent: "#f2635f" },
};
