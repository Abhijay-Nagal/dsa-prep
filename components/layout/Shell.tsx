"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHydrated as useHydratedLocal } from "@/hooks/useNow";
import { Icon } from "@/components/ui/Icon";
import { Bar, Ring, cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { levelFromXp, levelTitle } from "@/lib/engine/xp";
import { PROBLEMS } from "@/lib/data/problems";
import { ratingBand } from "@/lib/engine/mastery";

export const NAV = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard", hint: "Your plan for today" },
  { href: "/sheets", label: "Sheets", icon: "ListChecks", hint: "75 / 150 / 250 / 450 phases" },
  { href: "/companies", label: "Companies", icon: "Building2", hint: "Company-specific lists" },
  { href: "/problems", label: "Problem Bank", icon: "ListOrdered", hint: "All problems, every filter" },
  { href: "/visualize", label: "Visualise", icon: "PlayCircle", hint: "Animated algorithms" },
  { href: "/learn", label: "Learn", icon: "GraduationCap", hint: "Topics and patterns" },
  { href: "/revise", label: "Revise", icon: "Repeat", hint: "Spaced repetition queue" },
  { href: "/arena", label: "Arena", icon: "Swords", hint: "Mock rounds and games" },
  { href: "/stats", label: "Analytics", icon: "BarChart3", hint: "Mastery and trends" },
  { href: "/profile", label: "Profile", icon: "User", hint: "Achievements and settings" },
];

export { useHydrated } from "@/hooks/useNow";

function SidebarInner({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const hydrated = useHydratedLocal();
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const progress = useStore((s) => s.progress);
  const solved = hydrated ? Object.values(progress).filter((p) => p.status === "solved").length : 0;
  const lvl = levelFromXp(hydrated ? xp : 0);

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <Link
        href="/"
        onClick={onNavigate}
        className={cx("flex items-center gap-2.5 rounded-xl px-2 py-2", collapsed && "justify-center px-0")}
      >
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl grad-bg shadow-[var(--shadow-glow)]">
          <Icon name="Braces" size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight">
              DSA <span className="grad-text">Prep</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-faint">
              Interview OS
            </div>
          </div>
        )}
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : item.hint}
              className={cx(
                "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active ? "text-text" : "text-dim hover:bg-panel-2 hover:text-text",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-accent/40"
                  style={{ background: "var(--accent-soft)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={cx("relative", active && "text-accent")}>
                <Icon name={item.icon} size={17} />
              </span>
              {!collapsed && <span className="relative">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="panel space-y-3 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">
              Level {lvl.level}
              <span className="ml-1.5 font-normal text-faint">{levelTitle(lvl.level)}</span>
            </span>
            <span className="font-mono text-faint">{hydrated ? xp : 0} XP</span>
          </div>
          <Bar value={lvl.pct} height={6} />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <Icon name="Flame" size={14} className={cx("text-streak", streak.current > 0 && "animate-flame")} />
              <span className="font-semibold">{hydrated ? streak.current : 0}</span>
              <span className="text-faint">day</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Icon name="CheckCircle2" size={14} className="text-easy" />
              <span className="font-semibold">{solved}</span>
              <span className="text-faint">/ {PROBLEMS.length}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid place-items-center pb-2">
          <Ring value={lvl.pct} size={38} stroke={4}>
            <span className="text-[10px] font-bold">{lvl.level}</span>
          </Ring>
        </div>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const hydrated = useHydratedLocal();
  const theme = useStore((s) => s.settings.theme);
  const accent = useStore((s) => s.settings.accent);
  const setSetting = useStore((s) => s.setSetting);
  const streak = useStore((s) => s.streak);
  const rating = useStore((s) => s.rating);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--accent", accent);
  }, [theme, accent, hydrated]);

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 border-r border-line-soft lg:block"
        style={{ width: collapsed ? 74 : 236, transition: "width .22s cubic-bezier(.22,1,.36,1)" }}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[61] w-[252px] border-r border-line lg:hidden"
              style={{ background: "var(--bg-elev)" }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <SidebarInner collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line-soft px-3 backdrop-blur-xl sm:px-5"
          style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)" }}
        >
          <button className="btn btn-ghost !px-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Icon name="Menu" size={18} />
          </button>
          <button
            className="btn btn-ghost !px-2 max-lg:hidden"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <Icon name={collapsed ? "PanelLeft" : "PanelLeftClose"} size={18} />
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-palette"))}
            className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 text-left text-sm text-faint transition-colors hover:border-accent/50 sm:max-w-sm"
          >
            <Icon name="Search" size={15} />
            <span className="truncate">Search problems, topics, algorithms</span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] sm:block">
              Ctrl K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden items-center gap-1.5 rounded-xl border border-line bg-panel-2 px-2.5 py-1.5 sm:flex">
              <Icon name="Gauge" size={14} className="text-accent-3" />
              <span className="font-mono text-xs font-bold">{hydrated ? rating : 1200}</span>
              <span className="text-[10px] text-faint">{ratingBand(hydrated ? rating : 1200)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-panel-2 px-2.5 py-1.5">
              <Icon
                name="Flame"
                size={14}
                className={cx("text-streak", hydrated && streak.current > 0 && "animate-flame")}
              />
              <span className="font-mono text-xs font-bold">{hydrated ? streak.current : 0}</span>
            </div>
            <button
              className="btn btn-ghost !px-2"
              onClick={() => setSetting("theme", theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Icon name={theme === "dark" ? "Sun" : "MoonStar"} size={17} />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-10">{children}</main>

        {/* mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-line px-1 py-1.5 backdrop-blur-xl lg:hidden"
          style={{ background: "color-mix(in srgb, var(--bg-elev) 92%, transparent)" }}
        >
          {NAV.slice(0, 5).map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium",
                  active ? "text-accent" : "text-faint",
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
