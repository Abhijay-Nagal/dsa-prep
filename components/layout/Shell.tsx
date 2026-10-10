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
import { PALETTES, resolvePalette } from "@/lib/data/palettes";

export const NAV = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard", hint: "Your plan for today" },
  { href: "/sheets", label: "Sheets", icon: "ListChecks", hint: "75 / 150 / 250 / 450 phases" },
  { href: "/companies", label: "Companies", icon: "Building2", hint: "Company-specific lists" },
  { href: "/problems", label: "Problem Bank", icon: "ListOrdered", hint: "All problems, every filter" },
  { href: "/visualize", label: "Visualise", icon: "PlayCircle", hint: "Animated algorithms" },
  { href: "/learn", label: "Learn", icon: "GraduationCap", hint: "Topics and patterns" },
  { href: "/roadmap", label: "Roadmap", icon: "Map", hint: "The syllabus as a dependency graph" },
  { href: "/revise", label: "Revise", icon: "Repeat", hint: "Spaced repetition queue" },
  { href: "/arena", label: "Arena", icon: "Swords", hint: "Mock rounds and games" },
  { href: "/notebook", label: "Notebook", icon: "BookOpen", hint: "Your notes, stars and unfinished work" },
  { href: "/stats", label: "Analytics", icon: "BarChart3", hint: "Mastery and trends" },
  { href: "/profile", label: "Profile", icon: "User", hint: "Achievements and settings" },
];

export { useHydrated } from "@/hooks/useNow";

/**
 * `dockSpace` keeps the bottom of the desktop sidebar clear for the focus timer
 * dock, which is fixed to the bottom-left corner and would otherwise sit on top
 * of the level card.
 */
function SidebarInner({
  collapsed,
  onNavigate,
  dockSpace,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  dockSpace?: boolean;
}) {
  const pathname = usePathname();
  const hydrated = useHydratedLocal();
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const progress = useStore((s) => s.progress);
  const solved = hydrated ? Object.values(progress).filter((p) => p.status === "solved").length : 0;
  const lvl = levelFromXp(hydrated ? xp : 0);

  return (
    <div className={cx("relative flex h-full flex-col gap-3 p-3", dockSpace && "pb-[74px]")}>
      <SideHills />
      <Link
        href="/"
        onClick={onNavigate}
        className={cx("relative flex items-center gap-2.5 rounded-xl px-2 py-2", collapsed && "justify-center px-0")}
      >
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl grad-bg shadow-[var(--shadow-glow)]">
          <Icon name="Braces" size={18} className="on-accent" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight">
              DSA <span style={{ color: "var(--side-active-bg)" }}>Prep</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-faint">
              Interview OS
            </div>
          </div>
        )}
      </Link>

      <ThemeMenu collapsed={collapsed} />

      <nav className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto">
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
                active ? "font-semibold" : "text-dim hover:bg-panel-2 hover:text-text",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl shadow-[0_6px_18px_-10px_var(--side-active-bg)]"
                  style={{ background: "var(--side-active-bg)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative" style={active ? { color: "var(--side-active-text)" } : undefined}>
                <Icon name={item.icon} size={17} />
              </span>
              {!collapsed && (
                <span className="relative" style={active ? { color: "var(--side-active-text)" } : undefined}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="panel relative space-y-3 p-3">
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
        <div className="relative grid place-items-center pb-2">
          <Ring value={lvl.pct} size={38} stroke={4}>
            <span className="text-[10px] font-bold">{lvl.level}</span>
          </Ring>
        </div>
      )}
    </div>
  );
}

/** A ridge line at the foot of the sidebar, in a shade just off the sidebar itself. */
function SideHills() {
  return (
    <svg
      viewBox="0 0 240 120"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full"
      aria-hidden="true"
    >
      <path d="M0,70 L40,40 L70,58 L110,22 L150,60 L190,34 L240,62 L240,120 L0,120 z" style={{ fill: "var(--side-hill)" }} opacity={0.6} />
      <path d="M0,92 L50,66 L95,86 L140,58 L185,84 L240,70 L240,120 L0,120 z" style={{ fill: "var(--side-hill)" }} />
    </svg>
  );
}

/**
 * The theme picker, at the top of the sidebar. Expanded, it shows the current
 * theme by name and opens a list underneath; collapsed, it is an icon that
 * opens the list to the right. The list sits inside `.side`, so it is drawn in
 * the sidebar colours.
 */
function ThemeMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const hydrated = useHydratedLocal();
  const palette = useStore((s) => s.settings.palette);
  const setSetting = useStore((s) => s.setSetting);
  const current = resolvePalette(hydrated ? palette : undefined);

  return (
    <div className="relative z-20">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-expanded={open}
        title="Theme (t cycles)"
        className={cx(
          "flex w-full items-center gap-2.5 rounded-xl border border-line px-2.5 py-2 text-left text-sm transition-colors hover:bg-panel-2",
          collapsed && "justify-center px-0",
          open && "bg-panel-2",
        )}
      >
        <Icon name="Palette" size={16} className="shrink-0 text-dim" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-faint">Theme</span>
              <span className="block truncate font-semibold">{current.name}</span>
            </span>
            <span className="flex h-4 w-7 shrink-0 overflow-hidden rounded border border-line">
              {current.swatch.map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </span>
            <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="shrink-0 text-faint" />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className={cx(
                "absolute z-[71] w-60 rounded-xl border border-line p-2 shadow-[var(--shadow-lg)]",
                collapsed ? "left-full top-0 ml-2" : "inset-x-0 top-full mt-1.5 w-auto",
              )}
              style={{ background: "var(--side-panel)" }}
            >
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSetting("palette", p.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-panel-2",
                    current.id === p.id && "bg-panel-2 font-semibold",
                  )}
                >
                  <span className="flex h-5 w-9 shrink-0 overflow-hidden rounded-md border border-line">
                    {p.swatch.map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  {current.id === p.id && (
                    <Icon name="Check" size={13} className="shrink-0" style={{ color: "var(--side-active-bg)" }} />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const hydrated = useHydratedLocal();
  const palette = useStore((s) => s.settings.palette);
  const streak = useStore((s) => s.streak);
  const rating = useStore((s) => s.rating);

  useEffect(() => {
    if (!hydrated) return;
    const pal = resolvePalette(palette);
    const root = document.documentElement;
    root.dataset.palette = pal.id;
    root.dataset.theme = pal.mode;
    // The installed app's title bar takes the sidebar colour.
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", pal.swatch[0]);
  }, [palette, hydrated]);

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside
        className="side sticky top-0 z-30 hidden h-screen shrink-0 lg:block"
        style={{ width: collapsed ? 74 : 236, transition: "width .22s cubic-bezier(.22,1,.36,1)" }}
      >
        <SidebarInner collapsed={collapsed} dockSpace />
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
              className="side fixed inset-y-0 left-0 z-[61] w-[252px] lg:hidden"
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
              className="btn btn-ghost !px-2 max-sm:hidden"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-focus"))}
              title="Focus timer (f)"
              aria-label="Focus timer"
            >
              <Icon name="Timer" size={17} />
            </button>
            <button
              className="btn btn-ghost !px-2 max-lg:hidden"
              onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts"))}
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts"
            >
              <Icon name="Keyboard" size={17} />
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
