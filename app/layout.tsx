import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { ToastHost } from "@/components/layout/ToastHost";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { PwaBoot } from "@/components/layout/PwaBoot";
import { Onboarding } from "@/components/layout/Onboarding";
import { FocusTimer } from "@/components/layout/FocusTimer";
import { Shortcuts } from "@/components/layout/Shortcuts";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-var",
  subsets: ["latin"],
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
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DSA Prep" },
  keywords: ["DSA", "interview preparation", "Blind 75", "LeetCode", "algorithm visualiser", "spaced repetition"],
  openGraph: {
    title: "DSA Prep — Interview OS",
    description:
      "Nested problem sheets, company lists, animated algorithms and an adaptive planner in one installable app.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060a16" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/** Applies the stored theme before first paint so there is no flash. */
const themeScript = `
try {
  var raw = localStorage.getItem('dsa-prep-v1');
  var t = raw ? (JSON.parse(raw).state || {}).settings : null;
  if (t && t.theme) document.documentElement.dataset.theme = t.theme;
  if (t && t.palette) document.documentElement.dataset.palette = t.palette;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-palette="nebula"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
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
