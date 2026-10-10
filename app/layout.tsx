import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { ToastHost } from "@/components/layout/ToastHost";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { PwaBoot } from "@/components/layout/PwaBoot";
import { Onboarding } from "@/components/layout/Onboarding";
import { FocusTimer } from "@/components/layout/FocusTimer";
import { Shortcuts } from "@/components/layout/Shortcuts";
import { DEFAULT_PALETTE, LEGACY_PALETTES, PALETTES } from "@/lib/data/palettes";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

/** Serif for the greeting and section headings, as in the theme designs. */
const display = Fraunces({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSA Prep — Interview OS",
    template: "%s · DSA Prep",
  },
  description:
    "An offline-capable DSA interview trainer: nested 75/150/250/450 sheets, company-specific lists, animated algorithm visualisers, spaced repetition and an adaptive daily planner.",
  applicationName: "DSA Prep",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DSA Prep" },
  keywords: ["DSA", "interview preparation", "Blind 75", "LeetCode", "algorithm visualiser", "spaced repetition"],
  openGraph: {
    title: "DSA Prep — Interview OS",
    description:
      "Nested problem sheets, company lists, animated algorithms and an adaptive planner in one installable app.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2433",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Applies the stored theme before first paint so there is no flash. Old
 * palette ids are mapped to their replacement, and the mode comes from the
 * theme itself. Both tables are generated from lib/data/palettes.ts.
 */
const MODES = Object.fromEntries(PALETTES.map((p) => [p.id, p.mode]));
const themeScript = `
try {
  var modes = ${JSON.stringify(MODES)}, legacy = ${JSON.stringify(LEGACY_PALETTES)};
  var raw = localStorage.getItem('dsa-prep-v1');
  var t = raw ? (JSON.parse(raw).state || {}).settings : null;
  var id = t && t.palette;
  if (id && !modes[id]) id = legacy[id];
  if (id && modes[id]) {
    document.documentElement.dataset.palette = id;
    document.documentElement.dataset.theme = modes[id];
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      data-theme="light"
      data-palette={DEFAULT_PALETTE}
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Shell>{children}</Shell>
        <ToastHost />
        <CommandPalette />
        <Shortcuts />
        <FocusTimer />
        <Onboarding />
        <PwaBoot />
      </body>
    </html>
  );
}
