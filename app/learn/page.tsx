"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, Ring, Segmented, cx } from "@/components/ui/bits";
import { TOPICS, TOPIC_MAP, topicPath } from "@/lib/data/topics";
import { PATTERNS } from "@/lib/data/patterns";
import { byPattern, byTopic } from "@/lib/data/problems";
import { algosForTopic } from "@/lib/algo/registry";
import { getMastery } from "@/lib/engine/recommender";
import { useSnapshot } from "@/hooks/useLearner";
import { masteryColor, masteryLabel } from "@/lib/engine/mastery";
import { useHydrated } from "@/components/layout/Shell";

export default function LearnIndex() {
  const snap = useSnapshot();
  const hydrated = useHydrated();
  const [view, setView] = useState<"topics" | "patterns">("topics");
  const [q, setQ] = useState("");

  const path = useMemo(() => topicPath(), []);

  const topicRows = useMemo(
    () =>
      path.map((id) => {
        const t = TOPIC_MAP[id];
        const problems = byTopic(id);
        const solved = hydrated ? problems.filter((p) => snap.progress[p.id]?.status === "solved").length : 0;
        const m = getMastery(snap, id);
        const locked = t.prereq.some((p) => getMastery(snap, p).p < 0.35) && m.seen === 0;
        return { topic: t, total: problems.length, solved, mastery: m.p, locked, vizCount: algosForTopic(id).length };
      }),
    [path, snap, hydrated],
  );

  const patternRows = useMemo(
    () =>
      PATTERNS.filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.triggers.some((t) => t.toLowerCase().includes(q.toLowerCase())),
      ).map((p) => {
        const problems = byPattern(p.id);
        const solved = hydrated ? problems.filter((x) => snap.progress[x.id]?.status === "solved").length : 0;
        return { pattern: p, total: problems.length, solved, mastery: getMastery(snap, p.id).p };
      }),
    [q, snap, hydrated],
  );

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
            Learn in <span className="grad-text">dependency order</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-dim">
            {TOPICS.length} topics arranged so nothing asks you to use an idea you have not met yet, and{" "}
            {PATTERNS.length} patterns with the trigger phrases that give them away in a problem statement.
          </p>
        </div>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "topics", label: "Topics", icon: "Network" },
            { value: "patterns", label: "Patterns", icon: "Wand2" },
          ]}
        />
      </div>

      {view === "topics" ? (
        <div className="space-y-3">
          {topicRows.map((row, i) => {
            const t = row.topic;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(0.3, i * 0.03) }}
              >
                <Link
                  href={`/learn/${t.id}`}
                  className={cx("panel panel-hover flex flex-wrap items-center gap-4 p-4", row.locked && "opacity-70")}
                  style={{ borderLeft: `3px solid ${t.color}` }}
                >
                  <div className="flex w-9 shrink-0 justify-center">
                    <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <Ring value={row.mastery} size={48} stroke={5} color={masteryColor(row.mastery)}>
                    <Icon name={t.icon} size={16} style={{ color: t.color }} />
                  </Ring>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">{t.name}</span>
                      <Chip color={masteryColor(row.mastery)} className="!text-[9px]">
                        {masteryLabel(row.mastery)}
                      </Chip>
                      {row.locked && (
                        <Chip icon="Lock" className="!text-[9px]">
                          prerequisites first
                        </Chip>
                      )}
                      <span className="text-[10px] text-faint">
                        interview weight {Math.round(t.interviewWeight * 100)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-dim">{t.blurb}</p>
                    {t.prereq.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-faint">
                        after
                        {t.prereq.map((p) => (
                          <span key={p} className="chip !px-1.5 !py-0 !text-[9px]">
                            {TOPIC_MAP[p]?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-40">
                    <div className="mb-1 flex justify-between text-[10px] text-faint">
                      <span>{row.vizCount} visualiser{row.vizCount === 1 ? "" : "s"}</span>
                      <span className="font-mono">
                        {row.solved}/{row.total}
                      </span>
                    </div>
                    <Bar value={row.total ? row.solved / row.total : 0} color={t.color} height={5} />
                  </div>

                  <Icon name="ChevronRight" size={16} className="shrink-0 text-faint" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="panel p-3">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a pattern, or the phrase you saw in the problem"
                className="input !pl-9"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {patternRows.map((row) => {
              const p = row.pattern;
              const topic = TOPIC_MAP[p.topic];
              return (
                <Link key={p.id} href={`/learn/pattern/${p.id}`} className="panel panel-hover flex h-full flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold">{p.name}</div>
                      <Chip color={topic?.color} className="mt-1 !text-[9px]">
                        {topic?.name}
                      </Chip>
                    </div>
                    <Ring value={row.mastery} size={36} stroke={4} color={masteryColor(row.mastery)}>
                      <span className="text-[9px] font-bold">{Math.round(row.mastery * 100)}</span>
                    </Ring>
                  </div>
                  <p className="text-[11.5px] leading-snug text-dim">{p.idea}</p>
                  <div className="mt-auto space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-faint">Reach for it when you see</div>
                    <div className="flex flex-wrap gap-1">
                      {p.triggers.slice(0, 3).map((t) => (
                        <span key={t} className="chip !text-[9px] !italic">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-line-soft pt-2 text-[10px] text-faint">
                      <span className="font-mono">{p.complexity}</span>
                      <span className="font-mono">
                        {row.solved}/{row.total} problems
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
