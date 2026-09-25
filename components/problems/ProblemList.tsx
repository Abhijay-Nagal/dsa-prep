"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Difficulty, Problem, SolveStatus, Tier } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge, Segmented, cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { TOPIC_MAP, topicName } from "@/lib/data/topics";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { COMPANY_MAP } from "@/lib/data/companies";
import { SHEETS } from "@/lib/data/sheets";

/* ------------------------------ status control ----------------------------- */

const STATUS_META: Record<SolveStatus, { icon: string; color: string; label: string }> = {
  todo: { icon: "Circle", color: "var(--text-faint)", label: "Not started" },
  attempted: { icon: "CircleDot", color: "var(--medium)", label: "Attempted" },
  solved: { icon: "CheckCircle2", color: "var(--easy)", label: "Solved" },
  revisit: { icon: "Flag", color: "var(--hard)", label: "Needs revisit" },
};

const CYCLE: SolveStatus[] = ["todo", "solved", "attempted", "revisit"];

export function StatusButton({ id, size = 20 }: { id: string; size?: number }) {
  const hydrated = useHydrated();
  const status = useStore((s) => s.progress[id]?.status) ?? "todo";
  const markStatus = useStore((s) => s.markStatus);
  const meta = STATUS_META[hydrated ? status : "todo"];

  return (
    <button
      title={`${meta.label} — click to cycle`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = CYCLE[(CYCLE.indexOf(status) + 1) % CYCLE.length];
        markStatus(id, next);
      }}
      className="grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95"
      style={{ color: meta.color, width: size + 6, height: size + 6 }}
    >
      <motion.span key={status} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
        <Icon name={meta.icon} size={size} />
      </motion.span>
    </button>
  );
}

export function StarButton({ id }: { id: string }) {
  const hydrated = useHydrated();
  const starred = useStore((s) => s.progress[id]?.starred);
  const toggle = useStore((s) => s.toggleStar);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cx("shrink-0 transition-colors", hydrated && starred ? "text-gold" : "text-faint hover:text-gold")}
      title={starred ? "Remove bookmark" : "Bookmark"}
    >
      <Icon name={hydrated && starred ? "BookmarkCheck" : "Bookmark"} size={15} />
    </button>
  );
}

/* --------------------------------- one row -------------------------------- */

export function ProblemRow({
  p,
  index,
  sheetTier,
  compact,
}: {
  p: Problem;
  index?: number;
  sheetTier?: Tier;
  compact?: boolean;
}) {
  const hydrated = useHydrated();
  const prog = useStore((s) => s.progress[p.id]);
  const solved = hydrated && prog?.status === "solved";
  const carried = sheetTier !== undefined && solved && p.tier < sheetTier;
  const topic = TOPIC_MAP[p.topic];

  return (
    <motion.div
      layout
      className={cx(
        "group grid items-center gap-3 border-b border-line-soft px-3 py-2.5 transition-colors last:border-b-0 hover:bg-panel-2/60",
        compact
          ? "grid-cols-[auto_1fr_auto]"
          : "grid-cols-[auto_1fr_auto] md:grid-cols-[auto_minmax(0,1fr)_120px_92px_74px_auto]",
      )}
      style={solved ? { background: "color-mix(in srgb, var(--easy) 5%, transparent)" } : undefined}
    >
      <div className="flex items-center gap-1.5">
        {index !== undefined && (
          <span className="w-6 shrink-0 text-right font-mono text-[11px] text-faint">{index + 1}</span>
        )}
        <StatusButton id={p.id} size={compact ? 17 : 19} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/problems/${p.id}`}
            className={cx(
              "truncate text-sm font-medium transition-colors hover:text-accent",
              solved && "text-dim line-through decoration-easy/50",
            )}
          >
            {p.title}
          </Link>
          {p.must && (
            <span title="Must-do problem" className="text-gold">
              <Icon name="Star" size={11} />
            </span>
          )}
          {p.premium && <Chip className="!text-[9px]">premium</Chip>}
          {carried && (
            <Chip color="var(--easy)" icon="Check" className="!text-[9px]">
              done in {SHEETS.find((s) => s.tier === p.tier)?.short ?? p.tier}
            </Chip>
          )}
          {hydrated && prog?.status === "revisit" && (
            <Chip color="var(--hard)" className="!text-[9px]">
              revisit
            </Chip>
          )}
        </div>
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
            <DiffBadge d={p.difficulty} small />
            <span className="text-[10px] text-faint">{topicName(p.topic)}</span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="hidden min-w-0 md:block">
          <span className="truncate text-[11px] text-dim" style={{ color: topic?.color }}>
            {topicName(p.topic)}
          </span>
        </div>
      )}

      {!compact && (
        <div className="hidden md:block">
          <DiffBadge d={p.difficulty} />
        </div>
      )}

      {!compact && (
        <div className="hidden items-center gap-0.5 md:flex" title={`Asked frequency ${p.freq} of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="h-3 w-1 rounded-full"
              style={{ background: i < p.freq ? "var(--accent)" : "var(--panel-2)" }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <StarButton id={p.id} />
        {p.links.lcSlug && (
          <a
            href={`https://leetcode.com/problems/${p.links.lcSlug}/`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-faint transition-colors hover:text-accent-3"
            title="Open on LeetCode"
          >
            <Icon name="ExternalLink" size={14} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------- the table ------------------------------- */

type SortKey = "default" | "difficulty" | "frequency" | "topic" | "title";

export function ProblemList({
  problems,
  sheetTier,
  title,
  showFilters = true,
  groupByTopic = false,
  numbered = true,
  emptyNote,
}: {
  problems: Problem[];
  sheetTier?: Tier;
  title?: string;
  showFilters?: boolean;
  groupByTopic?: boolean;
  numbered?: boolean;
  emptyNote?: string;
}) {
  const hydrated = useHydrated();
  const progress = useStore((s) => s.progress);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState<"all" | "todo" | "solved" | "revisit" | "starred">("all");
  const [topic, setTopic] = useState("all");
  const [pattern, setPattern] = useState("all");
  const [company, setCompany] = useState("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [grouped, setGrouped] = useState(groupByTopic);
  const [mustOnly, setMustOnly] = useState(false);

  const topics = useMemo(() => [...new Set(problems.map((p) => p.topic))].sort(), [problems]);
  const patterns = useMemo(() => [...new Set(problems.flatMap((p) => p.patterns))].sort(), [problems]);
  const companies = useMemo(() => [...new Set(problems.flatMap((p) => p.companies))].sort(), [problems]);

  const filtered = useMemo(() => {
    let out = problems.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (diff !== "all" && p.difficulty !== diff) return false;
      if (topic !== "all" && p.topic !== topic) return false;
      if (pattern !== "all" && !p.patterns.includes(pattern)) return false;
      if (company !== "all" && !p.companies.includes(company)) return false;
      if (mustOnly && !p.must) return false;
      if (status !== "all") {
        const st = progress[p.id]?.status ?? "todo";
        if (status === "starred" && !progress[p.id]?.starred) return false;
        if (status === "todo" && st === "solved") return false;
        if (status === "solved" && st !== "solved") return false;
        if (status === "revisit" && st !== "revisit") return false;
      }
      return true;
    });
    const diffOrder: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };
    if (sort === "difficulty") out = [...out].sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty] || b.freq - a.freq);
    if (sort === "frequency") out = [...out].sort((a, b) => b.freq - a.freq || a.tier - b.tier);
    if (sort === "topic") out = [...out].sort((a, b) => (TOPIC_MAP[a.topic]?.order ?? 99) - (TOPIC_MAP[b.topic]?.order ?? 99));
    if (sort === "title") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [problems, q, diff, topic, pattern, company, status, sort, mustOnly, progress]);

  const solvedCount = hydrated ? filtered.filter((p) => progress[p.id]?.status === "solved").length : 0;

  const groups = useMemo(() => {
    if (!grouped) return null;
    const m = new Map<string, Problem[]>();
    for (const p of filtered) {
      if (!m.has(p.topic)) m.set(p.topic, []);
      m.get(p.topic)!.push(p);
    }
    return [...m.entries()].sort(
      (a, b) => (TOPIC_MAP[a[0]]?.order ?? 99) - (TOPIC_MAP[b[0]]?.order ?? 99),
    );
  }, [filtered, grouped]);

  const clear = () => {
    setQ(""); setDiff("all"); setStatus("all"); setTopic("all"); setPattern("all");
    setCompany("all"); setMustOnly(false); setSort("default");
  };
  const anyFilter = q || diff !== "all" || status !== "all" || topic !== "all" || pattern !== "all" || company !== "all" || mustOnly;

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="panel space-y-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by title"
                className="input !pl-9"
              />
            </div>
            <Segmented
              size="sm"
              value={diff}
              onChange={setDiff}
              options={[
                { value: "all", label: "All" },
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "Hard", label: "Hard" },
              ]}
            />
            <Segmented
              size="sm"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Any" },
                { value: "todo", label: "Unsolved" },
                { value: "solved", label: "Solved" },
                { value: "revisit", label: "Revisit" },
                { value: "starred", label: "Saved" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input !w-auto !py-1.5 !text-xs">
              <option value="all">Every topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {topicName(t)}
                </option>
              ))}
            </select>
            <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="input !w-auto !py-1.5 !text-xs">
              <option value="all">Every pattern</option>
              {patterns.map((p) => (
                <option key={p} value={p}>
                  {PATTERN_MAP[p]?.name ?? p}
                </option>
              ))}
            </select>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="input !w-auto !py-1.5 !text-xs">
              <option value="all">Every company</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {COMPANY_MAP[c]?.name ?? c}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input !w-auto !py-1.5 !text-xs">
              <option value="default">Sheet order</option>
              <option value="frequency">Most asked</option>
              <option value="difficulty">Easiest first</option>
              <option value="topic">By topic</option>
              <option value="title">A to Z</option>
            </select>
            <button className={cx("btn !py-1.5 !text-xs", mustOnly && "!border-gold !text-gold")} onClick={() => setMustOnly((v) => !v)}>
              <Icon name="Star" size={12} /> Must do
            </button>
            <button className={cx("btn !py-1.5 !text-xs", grouped && "!border-accent !text-accent")} onClick={() => setGrouped((v) => !v)}>
              <Icon name="Layers3" size={12} /> Group
            </button>
            {anyFilter && (
              <button className="btn btn-ghost !py-1.5 !text-xs" onClick={clear}>
                <Icon name="X" size={12} /> Clear
              </button>
            )}
            <span className="ml-auto font-mono text-[11px] text-faint">
              {solvedCount} / {filtered.length} solved
            </span>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        {title && (
          <div className="hairline flex items-center justify-between px-4 py-2.5">
            <h3 className="text-sm font-bold">{title}</h3>
            <span className="font-mono text-[11px] text-faint">{filtered.length}</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-faint">{emptyNote ?? "Nothing matches those filters."}</div>
        ) : groups ? (
          <div>
            {groups.map(([tid, list]) => {
              const done = hydrated ? list.filter((p) => progress[p.id]?.status === "solved").length : 0;
              return (
                <details key={tid} open className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-line-soft bg-panel-2/40 px-4 py-2 text-xs font-bold">
                    <Icon name="ChevronRight" size={12} className="transition-transform group-open:rotate-90" />
                    <span style={{ color: TOPIC_MAP[tid]?.color }}>{topicName(tid)}</span>
                    <span className="ml-auto font-mono text-[10px] text-faint">
                      {done} / {list.length}
                    </span>
                  </summary>
                  <AnimatePresence initial={false}>
                    {list.map((p, i) => (
                      <ProblemRow key={p.id} p={p} index={numbered ? i : undefined} sheetTier={sheetTier} />
                    ))}
                  </AnimatePresence>
                </details>
              );
            })}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((p, i) => (
              <ProblemRow key={p.id} p={p} index={numbered ? i : undefined} sheetTier={sheetTier} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

