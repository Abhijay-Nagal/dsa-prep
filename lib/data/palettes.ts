/**
 * The theme catalogue. The colours here are only for previews — the real
 * values live in `app/globals.css` under `:root[data-palette="..."]`, so the
 * page is correctly themed before any JavaScript runs. Keep the two in sync.
 *
 * Each theme is a whole look: a dark sidebar, a content surface, an accent and
 * a landscape for the dashboard hero. `mode` says whether the content surface
 * is light or dark, and is written to `data-theme` so native controls and
 * scrollbars follow it.
 */
export type SceneMotif = "pines" | "pagoda" | "cliffs" | "blossom" | "night";

export interface Palette {
  id: string;
  name: string;
  blurb: string;
  mode: "light" | "dark";
  motif: SceneMotif;
  /** Preview swatch: sidebar, accent, content surface. */
  swatch: [string, string, string];
  /** Preview background, matching that theme's --bg. */
  bg: string;
}

export const PALETTES: Palette[] = [
  {
    id: "amber-sunset",
    name: "Amber Sunset",
    blurb: "Warm peach and burnt orange under a slate sidebar. The default.",
    mode: "light",
    motif: "pines",
    swatch: ["#1f2433", "#d9661f", "#fbf3ea"],
    bg: "#fbf3ea",
  },
  {
    id: "lavender-dusk",
    name: "Lavender Dusk",
    blurb: "Soft violet with a plum sidebar. Calm and modern.",
    mode: "light",
    motif: "pines",
    swatch: ["#2a2145", "#7b4fe0", "#f3effb"],
    bg: "#f3effb",
  },
  {
    id: "mint-forest",
    name: "Mint Forest",
    blurb: "Fresh greens on cream with a deep forest sidebar.",
    mode: "light",
    motif: "pines",
    swatch: ["#1d3a2a", "#2f6b45", "#f1f4ea"],
    bg: "#f1f4ea",
  },
  {
    id: "ocean-cliff",
    name: "Ocean Cliff",
    blurb: "Sea teal and sunset gold with a deep marine sidebar.",
    mode: "light",
    motif: "cliffs",
    swatch: ["#0e3a46", "#17809a", "#eaf4f5"],
    bg: "#eaf4f5",
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    blurb: "Blush pink and rose with a maroon sidebar.",
    mode: "light",
    motif: "blossom",
    swatch: ["#4d1c25", "#c4485a", "#fbf0f1"],
    bg: "#fbf0f1",
  },
  {
    id: "lantern-lake",
    name: "Lantern Lake",
    blurb: "Gold lantern light over a dark teal lake. Dark and warm.",
    mode: "dark",
    motif: "pagoda",
    swatch: ["#0a1d22", "#f2b63a", "#0f2a30"],
    bg: "#0f2a30",
  },
  {
    id: "indigo-night",
    name: "Indigo Night",
    blurb: "Moonlit navy and electric blue. Dark and focused.",
    mode: "dark",
    motif: "night",
    swatch: ["#09122a", "#3b82f6", "#0e1a36"],
    bg: "#0e1a36",
  },
];

export const PALETTE_MAP: Record<string, Palette> = Object.fromEntries(PALETTES.map((p) => [p.id, p]));

export const DEFAULT_PALETTE = "amber-sunset";

/**
 * Palette ids from before the theme redesign, mapped to their closest new
 * theme so a saved choice still means something. Also read by the pre-paint
 * script in app/layout.tsx.
 */
export const LEGACY_PALETTES: Record<string, string> = {
  nebula: "indigo-night",
  indigo: "indigo-night",
  slate: "indigo-night",
  orchid: "lavender-dusk",
  sunset: "amber-sunset",
  aurora: "ocean-cliff",
};

/** Any stored id, old or unknown, resolved to a real theme. */
export const resolvePalette = (id: string | undefined): Palette =>
  PALETTE_MAP[id ?? ""] ?? PALETTE_MAP[LEGACY_PALETTES[id ?? ""] ?? ""] ?? PALETTE_MAP[DEFAULT_PALETTE];

export const paletteName = (id: string) => resolvePalette(id).name;

/** The theme after this one, for the `t` shortcut. */
export const nextPalette = (id: string): Palette => {
  const i = PALETTES.findIndex((p) => p.id === resolvePalette(id).id);
  return PALETTES[(i + 1) % PALETTES.length];
};
