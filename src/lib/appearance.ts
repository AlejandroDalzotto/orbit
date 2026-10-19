import type { Settings } from "../types/generated/Settings";
import type { Theme } from "../types/generated/Theme";

export const appearanceThemes = [
  { id: "dark", label: "Negro / original", description: "Negro profundo, plata y contraste editorial.", swatch: "bg-[#090909]", ink: "bg-[#f1f0ec]", background: "#090909" },
  { id: "dim", label: "Grafito / tenue", description: "Grises suaves para una luz más baja.", swatch: "bg-[#141414]", ink: "bg-[#f1f0ec]", background: "#141414" },
  { id: "cream", label: "Crema / almendra", description: "Papel cálido #F6E9C7 y tinta oscura.", swatch: "bg-[#f6e9c7]", ink: "bg-[#201d18]", background: "#f6e9c7" },
  { id: "ember", label: "Brasa / naranja quemado", description: "Grafito cálido con un resplandor naranja.", swatch: "bg-[radial-gradient(ellipse_at_top_right,#b84b1f,transparent_75%)] bg-[#191816]", ink: "bg-[#f2e9dd]", background: "#191816" },
] as const satisfies readonly { id: Theme; label: string; description: string; swatch: string; ink: string; background: string }[];

export function applyAppearance(settings: Settings) {
  const { theme, noiseEnabled } = settings;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.noiseEnabled = String(noiseEnabled);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", appearanceThemes.find((entry) => entry.id === theme)!.background);
  try {
    localStorage.setItem("orbit-theme", theme);
    localStorage.setItem("orbit-noise-enabled", String(noiseEnabled));
  } catch { /* SQLite remains authoritative when browser storage is unavailable. */ }
}
