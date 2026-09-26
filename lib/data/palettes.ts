/**
 * The palette catalogue. The colours here are only for previews — the real
 * values live in `app/globals.css` under `:root[data-palette="..."]`, so the
 * page is correctly themed before any JavaScript runs. Keep the two in sync.
 */
export interface Palette {
  id: string;
  name: string;
  blurb: string;
  /** Preview swatch: accent, accent-2, accent-3. */
  swatch: [string, string, string];
  /** Preview background, matching that palette's --bg. */
  bg: string;
}

export const PALETTES: Palette[] = [
  {
    id: "nebula",
    name: "Nebula",
    blurb: "Azure into violet on deep navy. The default.",
    swatch: ["#2b8aff", "#8b5cf6", "#f472b6"],
    bg: "#060a16",
  },
  {
    id: "orchid",
    name: "Orchid",
    blurb: "Magenta into violet on deep plum. The loudest one.",
    swatch: ["#c026d3", "#7c3aed", "#38bdf8"],
    bg: "#0c0617",
  },
  {
    id: "sunset",
    name: "Sunset",
    blurb: "Coral into hot pink on aubergine. Warm and high energy.",
    swatch: ["#ff5c4d", "#ff2e88", "#ffc24b"],
    bg: "#140a12",
  },
  {
    id: "aurora",
    name: "Aurora",
    blurb: "Cyan into azure on teal ink. Cool and calm.",
    swatch: ["#0fb9b1", "#2b8aff", "#a78bfa"],
    bg: "#04120f",
  },
  {
    id: "indigo",
    name: "Indigo",
    blurb: "The original look, if you preferred it.",
    swatch: ["#6d5efc", "#b15cff", "#34d3ff"],
    bg: "#05070d",
  },
  {
    id: "slate",
    name: "Slate",
    blurb: "Low chroma and quiet, for very long sessions.",
    swatch: ["#3b82f6", "#6366f1", "#06b6d4"],
    bg: "#0a0e14",
  },
];

export const PALETTE_MAP: Record<string, Palette> = Object.fromEntries(PALETTES.map((p) => [p.id, p]));

export const DEFAULT_PALETTE = "nebula";

export const paletteName = (id: string) => PALETTE_MAP[id]?.name ?? "Nebula";
