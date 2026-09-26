"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, DiffBadge, Empty, SectionTitle, Stat } from "@/components/ui/bits";
import { useDueReviews } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { schedulePreview, retrievability, DEFAULT_RETENTION } from "@/lib/engine/srs";
import { useNow } from "@/hooks/useNow";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { TOPIC_MAP } from "@/lib/data/topics";
import { PROBLEM_MAP } from "@/lib/data/problems";
import type { Grade } from "@/lib/types";

const GRADES: { g: Grade; label: string; body: string; color: string; icon: string }[] = [
  { g: 1, label: "Again", body: "Could not reconstruct it", color: "var(--hard)", icon: "RotateCcw" },
  { g: 2, label: "Hard", body: "Got there, slowly and painfully", color: "var(--medium)", icon: "Mountain" },
  { g: 3, label: "Good", body: "Recalled the approach cleanly", color: "var(--accent-3)", icon: "Check" },
  { g: 4, label: "Easy", body: "Instant, could write it blind", color: "var(--easy)", icon: "Zap" },
];

import { useOrigin } from "@/components/ui/PageNav";

export default function RevisePage() {
  useOrigin("/revise", "Review queue");
  const due = useDueReviews();
  const hydrated = useHydrated();
  const gradeReview = useStore((s) => s.gradeReview);
  const progress = useStore((s) => s.progress);
  const reviewCount = useStore((s) => s.reviewCount);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const now = useNow();

  const current = due[i];

  const forecast = useMemo(() => {
    const buckets: { label: string; count: number }[] = [
      { label: "Today", count: 0 },
      { label: "Tomorrow", count: 0 },
      { label: "This week", count: 0 },
      { label: "This month", count: 0 },
      { label: "Later", count: 0 },
    ];
    if (!hydrated || !now) return buckets;
    for (const p of Object.values(progress)) {
      if (!p.srs || p.srs.state === "new") continue;
      const days = (p.srs.due - now) / 86_400_000;
      if (days <= 0) buckets[0].count++;
      else if (days <= 1) buckets[1].count++;
      else if (days <= 7) buckets[2].count++;
      else if (days <= 31) buckets[3].count++;
      else buckets[4].count++;
    }
    return buckets;
  }, [progress, hydrated, now]);

  const tracked = hydrated ? Object.values(progress).filter((p) => p.srs && p.srs.state !== "new").length : 0;
  const preview = current && now ? schedulePreview(current.card, now) : null;

  const grade = (g: Grade) => {
    if (!current) return;
    gradeReview(current.problem.id, g);
    setRevealed(false);
    setDone((d) => d + 1);
    setI((x) => x + 1);
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Beat the <span className="grad-text">forgetting curve</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          Solving a problem once does not keep it. Each solved problem gets a memory model with its own stability and
          difficulty, and comes back exactly when your predicted recall drops to {Math.round(DEFAULT_RETENTION * 100)}%.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Due now" value={due.length} icon="Repeat" color="var(--accent-2)" />
        <Stat label="In rotation" value={tracked} sub="problems being tracked" icon="Brain" />
        <Stat label="Reviews done" value={hydrated ? reviewCount : 0} sub="lifetime" icon="CheckCheck" color="var(--easy)" />
        <Stat label="This session" value={done} sub={due.length ? `${due.length} left` : "queue clear"} icon="Zap" color="var(--gold)" />
      </div>

      {/* session */}
      {due.length === 0 ? (
        <Empty
          icon="CheckCheck"
          title="Nothing is due right now"
          body="Solve a few problems and they will start entering the review rotation. Come back tomorrow."
        />
      ) : !current ? (
        <div className="panel grid place-items-center gap-3 p-10 text-center">
          <Icon name="Trophy" size={28} className="text-gold" />
          <div className="text-lg font-bold">Queue cleared</div>
          <p className="max-w-sm text-sm text-dim">
            You reviewed {done} problem{done === 1 ? "" : "s"}. Each one just got a longer interval, so the queue will be
            shorter next time.
          </p>
          <Link href="/" className="btn btn-primary">
            Back to the plan
          </Link>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="hairline flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-semibold">
              <Icon name="Repeat" size={13} className="text-accent-2" />
              Review {i + 1} of {due.length}
            </span>
            <span className="font-mono text-faint">
              predicted recall {Math.round(current.recall * 100)}%
            </span>
          </div>
          <div className="px-4 pt-2">
            <Bar value={(i + 1) / due.length} color="var(--accent-2)" height={4} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.problem.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{current.problem.title}</h2>
                <DiffBadge d={current.problem.difficulty} />
                <Chip color={TOPIC_MAP[current.problem.topic]?.color}>{TOPIC_MAP[current.problem.topic]?.name}</Chip>
              </div>

              <p className="mt-3 text-sm text-dim">
                Without looking: what is the approach, and what are its time and space complexities?
              </p>

              {!revealed ? (
                <button className="btn btn-primary mt-4" onClick={() => setRevealed(true)}>
                  <Icon name="Eye" size={14} /> Show the answer
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 overflow-hidden">
                  <div className="rounded-xl border border-line-soft bg-panel-2/60 p-3.5">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-faint">Approach</div>
                    <p className="text-sm leading-relaxed">
                      {current.problem.approach ??
                        current.problem.patterns.map((p) => PATTERN_MAP[p]?.idea).filter(Boolean)[0] ??
                        "Recall your own notes for this one."}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {current.problem.time && <Chip icon="Clock">{current.problem.time}</Chip>}
                      {current.problem.space && <Chip icon="Layers">{current.problem.space}</Chip>}
                      {current.problem.patterns.map((p) => (
                        <Chip key={p} color="var(--accent)">
                          {PATTERN_MAP[p]?.name ?? p}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {progress[current.problem.id]?.notes && (
                    <div className="rounded-xl border border-medium/30 bg-medium/[0.06] p-3.5">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-medium">Your note</div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{progress[current.problem.id].notes}</p>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-[11px] text-faint">How did that recall feel?</div>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {GRADES.map((g) => (
                        <button
                          key={g.g}
                          onClick={() => grade(g.g)}
                          className="panel panel-hover p-3 text-left"
                          style={{ borderColor: `${g.color}44` }}
                        >
                          <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: g.color }}>
                            <Icon name={g.icon} size={13} /> {g.label}
                          </div>
                          <div className="mt-0.5 text-[10.5px] leading-snug text-faint">{g.body}</div>
                          <div className="mt-1.5 font-mono text-[10px]" style={{ color: g.color }}>
                            next in {preview?.[g.g]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-line-soft pt-3">
                    <Link href={`/problems/${current.problem.id}`} className="btn !py-1.5 !text-xs">
                      <Icon name="ExternalLink" size={12} /> Open the problem
                    </Link>
                    <button className="btn btn-ghost !py-1.5 !text-xs" onClick={() => { setRevealed(false); setI((x) => x + 1); }}>
                      Skip for now
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* queue + forecast */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle icon="CalendarCheck" title="Review forecast" sub="How the scheduler has spread your future workload." />
          <div className="panel space-y-2.5 p-4">
            {forecast.map((b) => {
              const max = Math.max(1, ...forecast.map((x) => x.count));
              return (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-dim">{b.label}</span>
                    <span className="font-mono text-faint">{b.count}</span>
                  </div>
                  <Bar value={b.count / max} color={b.label === "Today" ? "var(--accent-2)" : "var(--accent)"} height={5} />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle icon="ListOrdered" title="Weakest memories" sub="Lowest predicted recall across everything you have solved." />
          <div className="panel divide-y divide-line-soft">
            {(hydrated
              ? Object.entries(progress)
                  .filter(([, p]) => p.srs && p.srs.state !== "new")
                  .map(([id, p]) => ({ id, recall: retrievability(p.srs!, now), due: p.srs!.due }))
                  .sort((a, b) => a.recall - b.recall)
                  .slice(0, 6)
              : []
            ).map((r) => {
              const p = PROBLEM_MAP[r.id];
              if (!p) return null;
              return (
                <Link key={r.id} href={`/problems/${r.id}`} className="flex items-center gap-3 p-3 hover:bg-panel-2/60">
                  <div className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, r.recall * 100)}%`,
                        background: r.recall < 0.7 ? "var(--hard)" : r.recall < 0.9 ? "var(--medium)" : "var(--easy)",
                      }}
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs">{p.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-faint">{Math.round(r.recall * 100)}%</span>
                </Link>
              );
            })}
            {tracked === 0 && <div className="p-6 text-center text-xs text-faint">Nothing tracked yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
