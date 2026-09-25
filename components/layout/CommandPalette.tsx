"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { DiffBadge, cx } from "@/components/ui/bits";
import { PROBLEMS } from "@/lib/data/problems";
import { TOPICS } from "@/lib/data/topics";
import { COMPANIES } from "@/lib/data/companies";
import { ALGOS } from "@/lib/algo/registry";
import { PATTERNS } from "@/lib/data/patterns";
import { NAV } from "./Shell";
import { useStore } from "@/lib/store/useStore";
import { PROBLEM_MAP } from "@/lib/data/problems";
import { useHydrated } from "@/hooks/useNow";

interface Item {
  id: string;
  label: string;
  sub?: string;
  icon: string;
  /** Either a destination or an action. Actions win when both are set. */
  href?: string;
  run?: () => void;
  group: string;
  badge?: React.ReactNode;
  score: number;
}

/** Cheap fuzzy score: subsequence match with bonuses for prefix and word starts. */
function fuzzy(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 1000;
  if (t.startsWith(q)) return 700 - t.length;
  const idx = t.indexOf(q);
  if (idx >= 0) return 500 - idx - t.length * 0.1;
  // subsequence
  let ti = 0, hits = 0, streak = 0, best = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    if (found === ti) { streak++; best = Math.max(best, streak); } else streak = 0;
    ti = found + 1;
    hits++;
  }
  return 200 + hits * 4 + best * 6 - t.length * 0.2;
}

/** Module scope on purpose: the purity rule forbids Math.random in render. */
const randomProblemId = () => PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)].id;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();
  const theme = useStore((s) => s.settings.theme);
  const setSetting = useStore((s) => s.setSetting);
  const recent = useStore((s) => s.recent);

  useEffect(() => {
    const show = () => {
      setQ("");
      setSel(0);
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 30);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) show();
          return !o;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", show);
    };
  }, []);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    const push = (i: Omit<Item, "score">, hay: string) => {
      const s = q ? fuzzy(q, hay) : 0;
      if (q && s < 0) return;
      out.push({ ...i, score: s });
    };

    for (const n of NAV) push({ id: `nav-${n.href}`, label: n.label, sub: n.hint, icon: n.icon, href: n.href, group: "Go to" }, n.label);

    const actions: { label: string; sub: string; icon: string; run: () => void }[] = [
      {
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        sub: "Shortcut: t",
        icon: theme === "dark" ? "Sun" : "MoonStar",
        run: () => setSetting("theme", theme === "dark" ? "light" : "dark"),
      },
      { label: "Focus timer", sub: "Shortcut: f", icon: "Timer", run: () => window.dispatchEvent(new CustomEvent("toggle-focus")) },
      { label: "Keyboard shortcuts", sub: "Shortcut: ?", icon: "Keyboard", run: () => window.dispatchEvent(new CustomEvent("open-shortcuts")) },
      {
        label: "Surprise me with a problem",
        sub: "Random pick from the bank",
        icon: "Dices",
        run: () => router.push(`/problems/${randomProblemId()}`),
      },
      { label: "Race two algorithms", sub: "Side by side visualisers", icon: "Swords", run: () => router.push("/visualize/compare") },
      { label: "Complexity explorer", sub: "Drag n and watch it break", icon: "Gauge", run: () => router.push("/learn/complexity") },
    ];
    for (const a of actions) push({ id: `act-${a.label}`, label: a.label, sub: a.sub, icon: a.icon, run: a.run, group: "Actions" }, a.label);

    for (const p of PROBLEMS) {
      push(
        {
          id: `p-${p.id}`,
          label: p.title,
          sub: `${p.topic} · tier ${p.tier === 500 ? "vault" : p.tier}`,
          icon: "ListOrdered",
          href: `/problems/${p.id}`,
          group: "Problems",
          badge: <DiffBadge d={p.difficulty} small />,
        },
        p.title,
      );
    }
    for (const a of ALGOS) push({ id: `a-${a.slug}`, label: a.name, sub: "Visualiser", icon: "PlayCircle", href: `/visualize/${a.slug}`, group: "Visualisers" }, a.name);
    for (const t of TOPICS) push({ id: `t-${t.id}`, label: t.name, sub: "Topic", icon: t.icon, href: `/learn/${t.id}`, group: "Topics" }, t.name);
    for (const p of PATTERNS) push({ id: `pat-${p.id}`, label: p.name, sub: "Pattern", icon: "Wand2", href: `/learn/pattern/${p.id}`, group: "Patterns" }, p.name);
    for (const c of COMPANIES) push({ id: `c-${c.id}`, label: c.name, sub: "Company sheet", icon: "Building2", href: `/companies/${c.id}`, group: "Companies" }, c.name);

    if (!q) {
      const recentItems: Item[] = hydrated
        ? recent
            .map((id) => PROBLEM_MAP[id])
            .filter(Boolean)
            .slice(0, 4)
            .map((p) => ({
              id: `recent-${p.id}`,
              label: p.title,
              sub: "Recently opened",
              icon: "Clock",
              href: `/problems/${p.id}`,
              group: "Recent",
              badge: <DiffBadge d={p.difficulty} small />,
              score: 0,
            }))
        : [];
      return [
        ...recentItems,
        ...out.filter((i) => i.group === "Go to").slice(0, 8),
        ...out.filter((i) => i.group === "Actions"),
      ];
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 24);
  }, [q, theme, setSetting, router, hydrated, recent]);

  const go = (item?: Item) => {
    const target = item ?? items[sel];
    if (!target) return;
    setOpen(false);
    if (target.run) target.run();
    else if (target.href) router.push(target.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="panel relative w-full max-w-xl overflow-hidden shadow-2xl"
            style={{ background: "var(--bg-elev)" }}
            initial={{ scale: 0.96, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="hairline flex items-center gap-2 px-4">
              <Icon name="Search" size={16} className="text-faint" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
                  if (e.key === "Enter") { e.preventDefault(); go(); }
                }}
                placeholder="Search problems, visualisers, topics, companies"
                className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-faint"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <div className="p-6 text-center text-sm text-faint">Nothing matches that.</div>
              )}
              {items.map((item, i) => {
                const showGroup = i === 0 || items[i - 1].group !== item.group;
                return (
                  <div key={item.id}>
                    {showGroup && (
                      <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-faint">
                        {item.group}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={() => go(item)}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left",
                        i === sel ? "bg-panel-2" : "hover:bg-panel-2/60",
                      )}
                    >
                      <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-panel-2", i === sel && "text-accent")}>
                        <Icon name={item.icon} size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        {item.sub && <span className="block truncate text-[11px] text-faint">{item.sub}</span>}
                      </span>
                      {item.badge}
                      {i === sel && <Icon name="ArrowRight" size={14} className="shrink-0 text-faint" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="hairline flex items-center gap-4 px-4 py-2 text-[10px] text-faint">
              <span className="flex items-center gap-1"><Icon name="ChevronUp" size={10} /><Icon name="ChevronDown" size={10} /> navigate</span>
              <span>enter to open</span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-line px-1 font-mono">?</kbd> all shortcuts
              </span>
              <span className="ml-auto">{PROBLEMS.length} problems · {ALGOS.length} visualisers</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
