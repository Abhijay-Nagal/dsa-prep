"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, Ring, SectionTitle } from "@/components/ui/bits";
import { ProblemList } from "@/components/problems/ProblemList";
import { SHEET_MAP, nextSheet, prevSheet } from "@/lib/data/sheets";
import { problemsInTier } from "@/lib/data/problems";
import { useSnapshot } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { TOPIC_MAP } from "@/lib/data/topics";
import type { Difficulty } from "@/lib/types";

export default function SheetDetail() {
  const params = useParams<{ slug: string }>();
  const sheet = SHEET_MAP[params.slug];
  const hydrated = useHydrated();
  const snap = useSnapshot();
  const activeSheet = useStore((s) => s.settings.activeSheet);
  const setSetting = useStore((s) => s.setSetting);

  const problems = useMemo(() => (sheet ? problemsInTier(sheet.tier) : []), [sheet]);

  const stats = useMemo(() => {
    const solved = problems.filter((p) => snap.progress[p.id]?.status === "solved");
    const byDiff: Record<Difficulty, { total: number; done: number }> = {
      Easy: { total: 0, done: 0 },
      Medium: { total: 0, done: 0 },
      Hard: { total: 0, done: 0 },
    };
    const byTopic = new Map<string, { total: number; done: number }>();
    for (const p of problems) {
      byDiff[p.difficulty].total++;
      const t = byTopic.get(p.topic) ?? { total: 0, done: 0 };
      t.total++;
      byTopic.set(p.topic, t);
    }
    for (const p of solved) {
      byDiff[p.difficulty].done++;
      const t = byTopic.get(p.topic)!;
      t.done++;
    }
    const minutes = problems.filter((p) => snap.progress[p.id]?.status !== "solved").reduce((s, p) => s + p.est, 0);
    return {
      solved: solved.length,
      total: problems.length,
      pct: problems.length ? solved.length / problems.length : 0,
      byDiff,
      byTopic: [...byTopic.entries()].sort((a, b) => (TOPIC_MAP[a[0]]?.order ?? 99) - (TOPIC_MAP[b[0]]?.order ?? 99)),
      remainingMinutes: minutes,
    };
  }, [problems, snap]);

  if (!sheet) return notFound();

  const prev = prevSheet(sheet.id);
  const next = nextSheet(sheet.id);
  const carried = prev
    ? problemsInTier(prev.tier).filter((p) => snap.progress[p.id]?.status === "solved").length
    : 0;
  const isActive = activeSheet === sheet.id;
  const perDay = Math.max(1, Math.ceil((stats.total - stats.solved) / Math.max(1, sheet.weeks * 7)));

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div className="flex items-center gap-2 text-xs text-faint">
        <Link href="/sheets" className="hover:text-accent">
          Sheets
        </Link>
        <Icon name="ChevronRight" size={12} />
        <span>{sheet.name}</span>
      </div>

      {/* header */}
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 p-5">
          <Ring value={stats.pct} size={104} stroke={9} color={sheet.color}>
            <div className="text-center leading-none">
              <div className="text-xl font-extrabold">{Math.round(stats.pct * 100)}%</div>
              <div className="mt-0.5 font-mono text-[10px] text-faint">
                {stats.solved}/{stats.total}
              </div>
            </div>
          </Ring>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{sheet.name}</h1>
              {isActive ? (
                <Chip color={sheet.color} icon="Check">
                  active phase
                </Chip>
              ) : (
                <button
                  className="btn !py-1 !text-[11px]"
                  onClick={() => {
                    setSetting("activeSheet", sheet.id);
                    setSetting("activeTier", sheet.tier);
                  }}
                >
                  <Icon name="Target" size={11} /> Make this my phase
                </button>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-dim">{sheet.blurb}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip icon="Clock">{Math.round(stats.remainingMinutes / 60)}h of work left</Chip>
              <Chip icon="CalendarCheck">{perDay} per day to finish in {sheet.weeks} weeks</Chip>
              <Chip icon="ListOrdered">{stats.total} problems</Chip>
            </div>
          </div>
        </div>

        {prev && hydrated && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line-soft bg-panel-2/40 px-5 py-3 text-xs">
            <Icon name="CheckCheck" size={14} className="text-easy" />
            <span className="text-dim">
              You have already cleared <b className="text-easy">{carried}</b> of these while working{" "}
              {prev.name}. Those rows are marked carried over, so you never redo them.
            </span>
            <Link href={`/sheets/${prev.id}`} className="btn btn-ghost ml-auto !py-1 !text-[11px]">
              <Icon name="ArrowLeft" size={11} /> {prev.name}
            </Link>
          </div>
        )}
      </div>

      {/* difficulty + topic breakdown */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
              const color = d === "Easy" ? "var(--easy)" : d === "Medium" ? "var(--medium)" : "var(--hard)";
              const s = stats.byDiff[d];
              return (
                <div key={d} className="panel p-3 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-faint">{d}</div>
                  <div className="mt-1 text-lg font-extrabold" style={{ color }}>
                    {hydrated ? s.done : 0}
                  </div>
                  <div className="text-[10px] text-faint">of {s.total}</div>
                  <div className="mt-1.5">
                    <Bar value={s.total ? s.done / s.total : 0} color={color} height={4} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel p-4">
            <div className="mb-3 text-xs font-bold">By topic</div>
            <div className="space-y-2">
              {stats.byTopic.map(([tid, s]) => (
                <Link key={tid} href={`/learn/${tid}`} className="block">
                  <div className="mb-0.5 flex items-center justify-between text-[11px]">
                    <span className="truncate" style={{ color: TOPIC_MAP[tid]?.color }}>
                      {TOPIC_MAP[tid]?.name ?? tid}
                    </span>
                    <span className="font-mono text-faint">
                      {hydrated ? s.done : 0}/{s.total}
                    </span>
                  </div>
                  <Bar value={s.total ? s.done / s.total : 0} color={TOPIC_MAP[tid]?.color} height={4} />
                </Link>
              ))}
            </div>
          </div>

          {next && (
            <Link href={`/sheets/${next.id}`} className="panel panel-hover flex items-center gap-3 p-4">
              <Icon name="ArrowRight" size={16} style={{ color: next.color }} />
              <div className="min-w-0">
                <div className="text-sm font-bold">Next phase: {next.name}</div>
                <p className="text-[11px] text-faint">
                  Adds {problemsInTier(next.tier).length - stats.total} problems on top of this one.
                </p>
              </div>
            </Link>
          )}
        </div>

        <div>
          <SectionTitle title="The sheet" sub="Click the circle on any row to cycle status: unsolved, solved, attempted, revisit." />
          <ProblemList problems={problems} sheetTier={sheet.tier} groupByTopic />
        </div>
      </div>
    </div>
  );
}
