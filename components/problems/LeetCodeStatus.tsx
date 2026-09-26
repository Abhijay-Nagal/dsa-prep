"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge, cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore, useLcSolved } from "@/lib/store/useStore";
import { similarProblems } from "@/lib/engine/similar";
import { TOPIC_MAP } from "@/lib/data/topics";
import type { Problem } from "@/lib/types";

/**
 * The "already done this on LeetCode" panel.
 *
 * Marking it here does *not* tick the sheet, because they answer different
 * questions: one is "have I beaten this problem", the other is "have I worked
 * through this sheet". What the mark buys you is the list underneath — the same
 * idea in problems you have not solved yet, so the concept gets practised
 * without repeating the problem.
 */

const LC = "#ffa116";

const lcUrl = (p: Problem) => (p.links.lcSlug ? `https://leetcode.com/problems/${p.links.lcSlug}/` : undefined);

export function LeetCodeStatus({ problem }: { problem: Problem }) {
  const hydrated = useHydrated();
  const marked = useLcSolved(problem.id);
  const toggle = useStore((s) => s.toggleLcSolved);
  const markStatus = useStore((s) => s.markStatus);
  const lcSolved = useStore((s) => s.lcSolved);
  const progress = useStore((s) => s.progress);
  const solvedHere = progress[problem.id]?.status === "solved";

  const similar = useMemo(
    () => (marked ? similarProblems(problem, { lcSolved, progress, limit: 5 }) : []),
    [marked, problem, lcSolved, progress],
  );

  const on = hydrated && marked;
  const url = lcUrl(problem);

  return (
    <div className="panel overflow-hidden" style={on ? { borderColor: `${LC}66` } : undefined}>
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ background: `${LC}1f`, color: LC }}
        >
          <Icon name={on ? "BadgeCheck" : "ExternalLink"} size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{on ? "Solved on LeetCode" : "Already solved this on LeetCode?"}</div>
          <div className="text-[11px] leading-snug text-faint">
            {on
              ? "Kept separate from the sheet tick, so your sheet progress stays honest."
              : "Mark it and you get similar problems you have not done instead of a repeat."}
          </div>
        </div>
        <button
          onClick={() => toggle(problem.id)}
          className={cx("btn !py-1.5 !text-xs", on && "!text-white")}
          style={on ? { background: LC, borderColor: "transparent" } : undefined}
        >
          <Icon name={on ? "Check" : "Plus"} size={13} />
          {on ? "Marked" : "Mark done on LeetCode"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {on && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="hairline flex flex-wrap gap-2 bg-panel-2/30 px-4 py-2.5">
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn !py-1 !text-[11px]">
                  <Icon name="ExternalLink" size={11} /> Open on LeetCode
                </a>
              )}
              {!solvedHere && (
                <button onClick={() => markStatus(problem.id, "solved")} className="btn !py-1 !text-[11px]">
                  <Icon name="CheckCircle2" size={11} /> Also tick it on the sheet
                </button>
              )}
              <span className="self-center text-[10px] text-faint">
                Ticking the sheet awards XP and schedules it for review
              </span>
            </div>

            <div className="px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <Icon name="Shuffle" size={14} style={{ color: LC }} />
                <span className="text-sm font-bold">Practise the same idea instead</span>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-dim">
                Not solved on LeetCode yet, and close enough to {problem.title} that the approach carries over. Ranked by
                shared pattern first, then by how often each one is actually asked.
              </p>

              {similar.length === 0 ? (
                <p className="text-xs text-faint">
                  Nothing left that is close to this one and still unsolved. Either you have cleared this pattern, or the
                  bank has run out of siblings for it.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {similar.map((hit, i) => {
                    const t = TOPIC_MAP[hit.problem.topic];
                    const href = lcUrl(hit.problem);
                    return (
                      <motion.div
                        key={hit.problem.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 rounded-xl border border-line bg-panel-2/40 px-2.5 py-2"
                      >
                        <span className="w-4 shrink-0 text-center font-mono text-[10px] text-faint">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <Link
                            href={`/problems/${hit.problem.id}`}
                            className="block truncate text-xs font-semibold transition-colors hover:text-accent"
                          >
                            {hit.problem.title}
                          </Link>
                          <span className="flex items-center gap-1.5 text-[10px] text-faint">
                            <Icon name={t?.icon ?? "ListOrdered"} size={9} style={{ color: t?.color }} />
                            <span className="truncate">{hit.reason}</span>
                          </span>
                        </span>
                        <DiffBadge d={hit.problem.difficulty} small />
                        {hit.problem.links.lc && (
                          <Chip className="!text-[9px]">LC {hit.problem.links.lc}</Chip>
                        )}
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Solve it on LeetCode"
                            className="btn btn-ghost !px-1.5 !py-1"
                          >
                            <Icon name="ExternalLink" size={12} />
                          </a>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
