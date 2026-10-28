"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import {
  Chip,
  CountUp,
  DiffBadge,
  Empty,
  SectionTitle,
  Segmented,
  Stat,
  cx,
  tint,
} from "@/components/ui/bits";
import { useHydrated, useNow } from "@/hooks/useNow";
import { useOrigin } from "@/components/ui/PageNav";
import { useStore } from "@/lib/store/useStore";
import { PROBLEM_MAP, PROBLEMS } from "@/lib/data/problems";
import { TOPIC_MAP, TOPICS, topicName } from "@/lib/data/topics";
import { isLcSolved } from "@/lib/data/lc";
import { todayKey } from "@/lib/engine/xp";
import { StatusButton, StarButton, LcDoneButton } from "@/components/problems/ProblemList";
import { RefresherButton } from "@/components/problems/Refresher";
import type { Difficulty, Problem, ProblemProgress, TopicId } from "@/lib/types";

export interface SolvedEntry {
  problem: Problem;
  progress: ProblemProgress;
  solvedAt: number;
  timeSpent: number;
  confidence: number;
  attempts: number;
  hints: number;
  notes: string;
  hasCode: boolean;
  code?: Record<string, string>;
  starred: boolean;
  lcDone: boolean;
}

type ViewMode = "timeline" | "all" | "topics" | "lc";
type TimeRange = "all" | "today" | "7d" | "30d";
type SortOption = "newest" | "oldest" | "diff-desc" | "diff-asc" | "time-desc" | "confidence-desc" | "title";

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
  { value: "all", label: "All Solved", icon: "ListChecks" },
  { value: "timeline", label: "Timeline", icon: "Clock" },
  { value: "topics", label: "By Topic", icon: "Layers" },
  { value: "lc", label: "LeetCode Done", icon: "BadgeCheck" },
];

function formatSeconds(sec: number): string {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function formatSolveDate(ms: number, now: number) {
  if (!ms) {
    return {
      formatted: "Previously solved",
      relative: "Done",
      dateOnly: "Earlier",
      bucket: "Earlier",
    };
  }

  const d = new Date(ms);
  const dateOnly = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeOnly = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const formatted = `${dateOnly} · ${timeOnly}`;

  if (!now) {
    return { formatted, relative: dateOnly, dateOnly, bucket: dateOnly };
  }

  const todayStr = todayKey(new Date(now));
  const solveStr = todayKey(d);

  let bucket = dateOnly;
  const diffMs = now - ms;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (solveStr === todayStr) {
    bucket = "Today";
  } else if (diffDays === 1) {
    bucket = "Yesterday";
  } else if (diffDays < 7) {
    bucket = "This Week";
  } else if (diffDays < 30) {
    bucket = "Earlier This Month";
  } else {
    bucket = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  let relative = "";
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) relative = "Just now";
  else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
  else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
  else if (diffSec < 86400 * 2) relative = "Yesterday";
  else if (diffSec < 86400 * 7) relative = `${Math.floor(diffSec / 86400)}d ago`;
  else if (diffSec < 86400 * 30) relative = `${Math.floor(diffSec / (86400 * 7))}w ago`;
  else relative = dateOnly;

  return { formatted, relative, dateOnly, bucket };
}

export default function HistoryPage() {
  useOrigin("/history", "Solve History");
  const hydrated = useHydrated();
  const now = useNow();

  const progress = useStore((s) => s.progress);
  const lcSolved = useStore((s) => s.lcSolved);
  const historyView = useStore((s) => s.settings.historyView);
  const setSetting = useStore((s) => s.setSetting);

  const viewMode: ViewMode = hydrated && historyView ? historyView : "all";
  const setViewMode = (v: ViewMode) => setSetting("historyView", v);
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [topicFilter, setTopicFilter] = useState<"all" | TopicId>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [onlyNotes, setOnlyNotes] = useState(false);
  const [onlyCode, setOnlyCode] = useState(false);
  const [onlyStarred, setOnlyStarred] = useState(false);

  // Solved entries from app progress
  const allSolved = useMemo(() => {
    if (!hydrated) return [] as SolvedEntry[];

    const result: SolvedEntry[] = [];
    for (const [id, prog] of Object.entries(progress)) {
      if (prog.status !== "solved") continue;
      const prob = PROBLEM_MAP[id];
      if (!prob) continue;

      const solvedAt = prog.solvedAt ?? prog.lastSeen ?? 0;
      const notes = (prog.notes ?? "").trim();
      const code = prog.code;
      const hasCode = Boolean(code && Object.keys(code).some((k) => code[k]?.trim().length > 0));

      result.push({
        problem: prob,
        progress: prog,
        solvedAt,
        timeSpent: prog.timeSpent ?? 0,
        confidence: prog.confidence ?? 0,
        attempts: prog.attempts ?? 1,
        hints: prog.usedHints ?? 0,
        notes,
        hasCode,
        code,
        starred: Boolean(prog.starred),
        lcDone: isLcSolved(lcSolved, prob),
      });
    }

    return result;
  }, [hydrated, progress, lcSolved]);

  // Problems solved on LeetCode
  const lcSolvedEntries = useMemo(() => {
    if (!hydrated) return [] as { problem: Problem; inSheet: boolean; solvedAt?: number }[];

    return PROBLEMS.filter((p) => isLcSolved(lcSolved, p)).map((p) => ({
      problem: p,
      inSheet: progress[p.id]?.status === "solved",
      solvedAt: progress[p.id]?.solvedAt ?? progress[p.id]?.lastSeen,
    }));
  }, [hydrated, lcSolved, progress]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalSolved = allSolved.length;
    const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
    const totalBank = { Easy: 0, Medium: 0, Hard: 0 };
    for (const p of PROBLEMS) totalBank[p.difficulty]++;

    let totalSeconds = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;
    let cleanSolves = 0;

    for (const entry of allSolved) {
      byDiff[entry.problem.difficulty]++;
      totalSeconds += entry.timeSpent;
      if (entry.confidence > 0) {
        confidenceSum += entry.confidence;
        confidenceCount++;
      }
      if (entry.hints === 0) cleanSolves++;
    }

    const avgConfidence = confidenceCount > 0 ? (confidenceSum / confidenceCount).toFixed(1) : "—";
    const totalMinutes = Math.round(totalSeconds / 60);
    const avgMinutesPerSolve = totalSolved > 0 ? Math.round(totalMinutes / totalSolved) : 0;

    return {
      totalSolved,
      byDiff,
      totalBank,
      totalMinutes,
      avgMinutesPerSolve,
      avgConfidence,
      cleanSolves,
      lcCount: lcSolvedEntries.length,
    };
  }, [allSolved, lcSolvedEntries]);

  // Filtered entries
  const filteredList = useMemo(() => {
    let list = [...allSolved];

    // Search query
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((e) => {
        const p = e.problem;
        return (
          p.title.toLowerCase().includes(needle) ||
          p.topic.toLowerCase().includes(needle) ||
          topicName(p.topic).toLowerCase().includes(needle) ||
          p.patterns.some((pat) => pat.toLowerCase().includes(needle)) ||
          p.companies.some((comp) => comp.toLowerCase().includes(needle)) ||
          e.notes.toLowerCase().includes(needle)
        );
      });
    }

    // Difficulty filter
    if (difficulty !== "all") {
      list = list.filter((e) => e.problem.difficulty === difficulty);
    }

    // Topic filter
    if (topicFilter !== "all") {
      list = list.filter((e) => e.problem.topic === topicFilter);
    }

    // Time range filter
    if (timeRange !== "all" && now > 0) {
      const msMap: Record<TimeRange, number> = {
        all: 0,
        today: 86_400_000,
        "7d": 7 * 86_400_000,
        "30d": 30 * 86_400_000,
      };
      const limit = now - msMap[timeRange];
      list = list.filter((e) => e.solvedAt >= limit);
    }

    // Boolean toggles
    if (onlyNotes) list = list.filter((e) => e.notes.length > 0);
    if (onlyCode) list = list.filter((e) => e.hasCode);
    if (onlyStarred) list = list.filter((e) => e.starred);

    // Sorting
    const diffWeight: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

    list.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.solvedAt - a.solvedAt;
        case "oldest":
          return a.solvedAt - b.solvedAt;
        case "diff-desc":
          return diffWeight[b.problem.difficulty] - diffWeight[a.problem.difficulty];
        case "diff-asc":
          return diffWeight[a.problem.difficulty] - diffWeight[b.problem.difficulty];
        case "time-desc":
          return b.timeSpent - a.timeSpent;
        case "confidence-desc":
          return b.confidence - a.confidence;
        case "title":
          return a.problem.title.localeCompare(b.problem.title);
        default:
          return b.solvedAt - a.solvedAt;
      }
    });

    return list;
  }, [allSolved, q, difficulty, topicFilter, timeRange, sortOption, onlyNotes, onlyCode, onlyStarred, now]);

  // Timeline groups: Map from bucket name -> entries
  const timelineGroups = useMemo(() => {
    const groups = new Map<string, SolvedEntry[]>();
    for (const entry of filteredList) {
      const { bucket } = formatSolveDate(entry.solvedAt, now);
      if (!groups.has(bucket)) groups.set(bucket, []);
      groups.get(bucket)!.push(entry);
    }
    return Array.from(groups.entries());
  }, [filteredList, now]);

  // Topic groups
  const topicGroups = useMemo(() => {
    const groups = new Map<TopicId, SolvedEntry[]>();
    for (const entry of filteredList) {
      const top = entry.problem.topic;
      if (!groups.has(top)) groups.set(top, []);
      groups.get(top)!.push(entry);
    }
    return TOPICS.map((t) => ({
      topic: t,
      entries: groups.get(t.id) ?? [],
    })).filter((g) => g.entries.length > 0);
  }, [filteredList]);

  // Export handlers
  const exportMarkdown = () => {
    const lines = [
      "# DSA Prep — Solved Questions History",
      "",
      `Total Solved: ${allSolved.length} problems | Practice Time: ${stats.totalMinutes} minutes`,
      `Exported: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      "",
      "| # | Problem | Difficulty | Topic | Solved Date | Time Spent | Confidence | LeetCode |",
      "|---|---|---|---|---|---|---|---|",
    ];

    allSolved.forEach((e, idx) => {
      const { dateOnly } = formatSolveDate(e.solvedAt, now);
      const lc = e.problem.links.lcSlug
        ? `[#${e.problem.links.lc ?? "LC"}](https://leetcode.com/problems/${e.problem.links.lcSlug}/)`
        : "—";
      const conf = e.confidence > 0 ? `${e.confidence}/5 ★` : "—";
      const time = formatSeconds(e.timeSpent);
      lines.push(
        `| ${idx + 1} | ${e.problem.title} | ${e.problem.difficulty} | ${topicName(e.problem.topic)} | ${dateOnly} | ${time} | ${conf} | ${lc} |`,
      );
    });

    lines.push("", "## Notes from Solved Problems", "");
    for (const e of allSolved) {
      if (e.notes) {
        lines.push(`### ${e.problem.title} (${e.problem.difficulty})`, "", e.notes, "");
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-prep-solved-history-${todayKey(new Date(now || Date.now()))}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      "Title",
      "Difficulty",
      "Topic",
      "Solved Date",
      "Time Spent (sec)",
      "Attempts",
      "Hints Used",
      "Confidence (1-5)",
      "Starred",
      "LeetCode Slug",
    ];
    const rows = allSolved.map((e) => {
      const { dateOnly } = formatSolveDate(e.solvedAt, now);
      return [
        `"${e.problem.title.replace(/"/g, '""')}"`,
        e.problem.difficulty,
        `"${topicName(e.problem.topic)}"`,
        `"${dateOnly}"`,
        e.timeSpent,
        e.attempts,
        e.hints,
        e.confidence,
        e.starred ? "Yes" : "No",
        e.problem.links.lcSlug ? `"${e.problem.links.lcSlug}"` : "",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-prep-solved-history-${todayKey(new Date(now || Date.now()))}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      {/* Header Banner */}
      <SectionTitle
        icon="History"
        title={
          <span>
            Solve <span className="grad-text">History</span>
          </span>
        }
        sub="Your complete record of solved questions, timestamped solves, practice duration, and solution notes."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={allSolved.length === 0}
              className="btn btn-ghost !py-1.5 !text-xs"
              title="Download CSV spreadsheet"
            >
              <Icon name="Download" size={13} />
              CSV
            </button>
            <button
              onClick={exportMarkdown}
              disabled={allSolved.length === 0}
              className="btn !py-1.5 !text-xs"
              title="Export complete markdown report"
            >
              <Icon name="Download" size={13} />
              Export Markdown
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Questions Solved"
          value={<CountUp to={stats.totalSolved} />}
          sub={`${Math.round((stats.totalSolved / (PROBLEMS.length || 1)) * 100)}% of problem bank`}
          icon="CheckCircle2"
          color="var(--easy)"
        />
        <Stat
          label="Practice Time"
          value={
            stats.totalMinutes >= 60
              ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
              : `${stats.totalMinutes}m`
          }
          sub={stats.avgMinutesPerSolve > 0 ? `~${stats.avgMinutesPerSolve} mins avg per solve` : "Logged problem time"}
          icon="Timer"
          color="var(--accent)"
        />
        <Stat
          label="Quality & Confidence"
          value={`${stats.avgConfidence} ★`}
          sub={`${stats.cleanSolves} clean solves (0 hints)`}
          icon="Sparkles"
          color="var(--gold)"
        />
        <Stat
          label="Difficulty Mix"
          value={`${stats.byDiff.Easy}E · ${stats.byDiff.Medium}M · ${stats.byDiff.Hard}H`}
          sub={
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-easy">
                {stats.totalBank.Easy ? Math.round((stats.byDiff.Easy / stats.totalBank.Easy) * 100) : 0}% E
              </span>
              <span className="text-faint">·</span>
              <span className="text-[10px] font-semibold text-medium">
                {stats.totalBank.Medium ? Math.round((stats.byDiff.Medium / stats.totalBank.Medium) * 100) : 0}% M
              </span>
              <span className="text-faint">·</span>
              <span className="text-[10px] font-semibold text-hard">
                {stats.totalBank.Hard ? Math.round((stats.byDiff.Hard / stats.totalBank.Hard) * 100) : 0}% H
              </span>
            </div>
          }
          icon="Gauge"
          color="var(--accent-3)"
        />
      </div>

      {/* Controls Bar */}
      <div className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />

          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Icon
              name="Search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by question, topic, pattern, or notes..."
              className="input !py-1.5 !pl-9 !text-xs"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="btn-ghost btn absolute right-2 top-1/2 -translate-y-1/2 !p-1 text-faint hover:text-text"
              >
                <Icon name="X" size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line-soft pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-faint">Difficulty:</span>
            {(["all", "Easy", "Medium", "Hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cx(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  difficulty === d
                    ? "grad-bg on-accent font-semibold shadow-sm"
                    : "bg-panel-2 text-dim hover:bg-panel hover:text-text",
                )}
              >
                {d === "all" ? "All" : d}
              </button>
            ))}

            <span className="mx-2 hidden h-4 w-px bg-line sm:block" />

            <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-wider text-faint sm:inline">
              Period:
            </span>
            {(
              [
                { value: "all", label: "All time" },
                { value: "today", label: "Today" },
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeRange(t.value)}
                className={cx(
                  "rounded-lg px-2 py-1 text-xs transition-colors",
                  timeRange === t.value ? "bg-panel-2 font-bold text-accent" : "text-faint hover:text-dim",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Topic dropdown */}
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as "all" | TopicId)}
              className="rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-xs text-dim outline-none focus:border-accent"
            >
              <option value="all">All Topics ({TOPICS.length})</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Sort dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-xs text-dim outline-none focus:border-accent"
            >
              <option value="newest">Newest Solved</option>
              <option value="oldest">Oldest Solved</option>
              <option value="diff-desc">Difficulty (Hard → Easy)</option>
              <option value="diff-asc">Difficulty (Easy → Hard)</option>
              <option value="time-desc">Time Spent (High → Low)</option>
              <option value="confidence-desc">Confidence (High → Low)</option>
              <option value="title">Title (A → Z)</option>
            </select>

            {/* Quick toggles */}
            <button
              onClick={() => setOnlyNotes((v) => !v)}
              className={cx(
                "flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors",
                onlyNotes
                  ? "border-accent bg-accent-soft font-semibold text-accent"
                  : "border-line bg-panel-2 text-faint hover:text-text",
              )}
              title="Show only problems with notes"
            >
              <Icon name="StickyNote" size={12} />
              Notes
            </button>

            <button
              onClick={() => setOnlyCode((v) => !v)}
              className={cx(
                "flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors",
                onlyCode
                  ? "border-accent bg-accent-soft font-semibold text-accent"
                  : "border-line bg-panel-2 text-faint hover:text-text",
              )}
              title="Show only problems with saved code"
            >
              <Icon name="Code2" size={12} />
              Code
            </button>

            <button
              onClick={() => setOnlyStarred((v) => !v)}
              className={cx(
                "flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors",
                onlyStarred
                  ? "border-gold/50 bg-gold/10 font-semibold text-gold"
                  : "border-line bg-panel-2 text-faint hover:text-text",
              )}
              title="Show bookmarked only"
            >
              <Icon name="Star" size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "lc" ? (
        <LeetCodeSolvedView items={lcSolvedEntries} />
      ) : filteredList.length === 0 ? (
        <Empty
          icon="History"
          title={allSolved.length === 0 ? "No questions solved yet" : "No solved questions match your filters"}
          body={
            allSolved.length === 0
              ? "As you solve problems across the sheets and mark them completed, your complete historical timeline with time logs and notes will appear here."
              : "Try clearing your search query or selecting 'All' for difficulty and periods."
          }
        />
      ) : viewMode === "timeline" ? (
        <div className="space-y-6">
          {timelineGroups.map(([bucket, group]) => (
            <div key={bucket} className="space-y-2.5">
              <div className="sticky top-14 z-10 flex items-center gap-2 rounded-lg bg-bg/90 py-1.5 backdrop-blur-md">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-panel-2 text-accent">
                  <Icon name="CalendarCheck" size={13} />
                </span>
                <span className="text-xs font-bold tracking-tight text-text">{bucket}</span>
                <span className="rounded-full bg-panel-2 px-2 py-0.2 font-mono text-[10px] text-faint">
                  {group.length} {group.length === 1 ? "solve" : "solves"}
                </span>
                <div className="ml-auto h-px flex-1 bg-line-soft" />
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {group.map((entry) => (
                    <HistoryItemCard key={entry.problem.id} entry={entry} now={now} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "topics" ? (
        <div className="space-y-6">
          {topicGroups.map(({ topic, entries }) => (
            <div key={topic.id} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-7 w-7 place-items-center rounded-lg"
                  style={{ background: tint(topic.color, 12), color: topic.color }}
                >
                  <Icon name={topic.icon} size={15} />
                </span>
                <div>
                  <div className="text-sm font-bold">{topic.name}</div>
                  <div className="text-[10px] text-faint">
                    {entries.length} solved · {topic.blurb}
                  </div>
                </div>
                <div className="ml-auto h-px flex-1 bg-line-soft" />
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <HistoryItemCard key={entry.problem.id} entry={entry} now={now} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat list view */
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredList.map((entry) => (
              <HistoryItemCard key={entry.problem.id} entry={entry} now={now} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/** Individual Solved Question Card in History */
function HistoryItemCard({ entry, now }: { entry: SolvedEntry; now: number }) {
  const [expandNotes, setExpandNotes] = useState(false);
  const [expandCode, setExpandCode] = useState(false);
  const [activeLang, setActiveLang] = useState<string>("");

  const p = entry.problem;
  const topic = TOPIC_MAP[p.topic];
  const { formatted, relative } = formatSolveDate(entry.solvedAt, now);

  const codeKeys = useMemo(() => {
    if (!entry.code) return [];
    return Object.keys(entry.code).filter((k) => entry.code![k]?.trim().length > 0);
  }, [entry.code]);

  const currentLang = activeLang || codeKeys[0] || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="panel panel-hover overflow-hidden transition-all"
    >
      <div className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center">
        {/* Left: Status & Problem identity */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="pt-0.5">
            <StatusButton id={p.id} size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/problems/${p.id}`}
                className="text-sm font-semibold tracking-tight transition-colors hover:text-accent"
              >
                {p.title}
              </Link>
              <DiffBadge d={p.difficulty} small />
              {p.must && (
                <span title="Must-do problem" className="text-gold">
                  <Icon name="Star" size={12} />
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-faint">
              <span
                className="inline-flex items-center gap-1 font-medium"
                style={{ color: topic?.color ?? "var(--accent)" }}
              >
                <Icon name={topic?.icon ?? "Circle"} size={11} />
                {topicName(p.topic)}
              </span>

              <span>·</span>
              <span title={formatted} className="text-dim">
                <Icon name="CalendarCheck" size={11} className="mr-1 inline text-accent/70" />
                {relative}
              </span>

              {entry.timeSpent > 0 && (
                <>
                  <span>·</span>
                  <span className="font-mono text-dim" title={`${entry.timeSpent} seconds total`}>
                    <Icon name="Clock" size={11} className="mr-1 inline text-accent/70" />
                    {formatSeconds(entry.timeSpent)}
                  </span>
                </>
              )}

              {entry.attempts > 1 && (
                <>
                  <span>·</span>
                  <span className="text-faint">{entry.attempts} attempts</span>
                </>
              )}

              {entry.hints > 0 ? (
                <>
                  <span>·</span>
                  <span className="text-medium">{entry.hints} hint used</span>
                </>
              ) : (
                <>
                  <span>·</span>
                  <span className="text-easy font-medium">Clean solve</span>
                </>
              )}

              {entry.confidence > 0 && (
                <>
                  <span>·</span>
                  <span className="text-gold font-mono" title={`Confidence: ${entry.confidence}/5`}>
                    {"★".repeat(entry.confidence)}
                    {"☆".repeat(5 - entry.confidence)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions & Expanders */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
          {entry.notes && (
            <button
              onClick={() => setExpandNotes((v) => !v)}
              className={cx(
                "btn !py-1 !text-xs",
                expandNotes ? "bg-accent-soft font-semibold text-accent" : "btn-ghost text-dim",
              )}
              title="Toggle solved notes"
            >
              <Icon name="StickyNote" size={12} />
              <span>Notes</span>
            </button>
          )}

          {entry.hasCode && (
            <button
              onClick={() => setExpandCode((v) => !v)}
              className={cx(
                "btn !py-1 !text-xs",
                expandCode ? "bg-accent-soft font-semibold text-accent" : "btn-ghost text-dim",
              )}
              title="Toggle solution code"
            >
              <Icon name="Code2" size={12} />
              <span>Code</span>
            </button>
          )}

          <RefresherButton id={p.id} />
          <LcDoneButton id={p.id} />
          <StarButton id={p.id} />

          {p.links.lcSlug && (
            <a
              href={`https://leetcode.com/problems/${p.links.lcSlug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-faint transition-colors hover:text-accent-3 p-1"
              title="Open problem on LeetCode"
            >
              <Icon name="ExternalLink" size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Expandable Notes section */}
      <AnimatePresence>
        {expandNotes && entry.notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="hairline border-t border-line-soft bg-panel-2/40 px-4 py-3"
          >
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-faint">
              <span className="flex items-center gap-1.5 text-accent">
                <Icon name="StickyNote" size={12} />
                Your Solution Notes
              </span>
              <span className="font-mono text-[10px]">{entry.notes.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-dim">{entry.notes}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Code section */}
      <AnimatePresence>
        {expandCode && entry.hasCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="hairline border-t border-line-soft bg-[#141721] p-3 text-white"
          >
            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                {codeKeys.map((k) => (
                  <button
                    key={k}
                    onClick={() => setActiveLang(k)}
                    className={cx(
                      "rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors",
                      currentLang === k ? "bg-accent text-white font-bold" : "bg-white/10 text-white/60 hover:text-white",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const src = entry.code?.[currentLang] ?? "";
                  navigator.clipboard.writeText(src);
                }}
                className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white"
                title="Copy solution code"
              >
                <Icon name="Copy" size={12} />
                <span>Copy</span>
              </button>
            </div>

            <pre className="max-h-64 overflow-x-auto overflow-y-auto font-mono text-xs leading-relaxed text-[#c8d3f5]">
              <code>{entry.code?.[currentLang] ?? "// No code saved"}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** LeetCode Solved View Tab */
function LeetCodeSolvedView({
  items,
}: {
  items: { problem: Problem; inSheet: boolean; solvedAt?: number }[];
}) {
  if (items.length === 0) {
    return (
      <Empty
        icon="BadgeCheck"
        title="No problems marked on LeetCode yet"
        body="Use the 'Done on LeetCode' toggle or paste a list in Sheets / Profile to track your external solves alongside sheet progress."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-xs">
        <div className="flex items-center gap-2">
          <Icon name="BadgeCheck" size={18} className="text-[#ffa116]" />
          <div>
            <div className="font-bold text-sm">
              {items.length} problems beaten on LeetCode
            </div>
            <div className="text-dim text-[11px]">
              {items.filter((x) => x.inSheet).length} are also marked solved in DSA Prep sheets
            </div>
          </div>
        </div>

        <Link href="/sheets" className="btn btn-ghost !py-1 !text-xs">
          Open Sheets <Icon name="ArrowRight" size={12} />
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ problem: p, inSheet }) => (
          <div key={p.id} className="panel panel-hover flex items-center justify-between gap-2 p-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/problems/${p.id}`}
                className="block truncate text-xs font-semibold hover:text-accent"
              >
                {p.title}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-faint">
                <DiffBadge d={p.difficulty} small />
                <span>{topicName(p.topic)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {inSheet ? (
                <Chip color="var(--easy)" icon="Check" className="!text-[9px]">
                  Solved here
                </Chip>
              ) : (
                <Chip color="#ffa116" icon="BadgeCheck" className="!text-[9px]">
                  LC only
                </Chip>
              )}

              {p.links.lcSlug && (
                <a
                  href={`https://leetcode.com/problems/${p.links.lcSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-faint hover:text-text"
                  title="Open on LeetCode"
                >
                  <Icon name="ExternalLink" size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
