"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Chip, Modal, cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore, useLcSolved } from "@/lib/store/useStore";
import { refresherFor, type Refresher } from "@/lib/data/notes";
import { PROBLEM_MAP } from "@/lib/data/problems";
import type { Problem } from "@/lib/types";

/**
 * The quick refresher: key idea, steps, the usual mistake and complexity, for
 * someone who has solved the problem before and needs it back in a minute.
 *
 * It is a spoiler, so it starts folded until the problem has been solved here
 * or marked as done on LeetCode. The open state is derived from that, with a
 * local override, rather than synced into state in an effect.
 */

function RefresherBody({ r }: { r: Refresher }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium leading-relaxed">{r.idea}</p>
      <ol className="space-y-1.5">
        {r.steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-dim">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold text-accent"
              style={{ background: "var(--accent-soft)" }}>
              {i + 1}
            </span>
            <span className="min-w-0">{s}</span>
          </li>
        ))}
      </ol>
      {r.pitfall && (
        <div className="flex gap-2 rounded-xl border border-medium/40 bg-medium/10 px-3 py-2 text-xs leading-relaxed">
          <Icon name="AlertTriangle" size={13} className="mt-0.5 shrink-0 text-medium" />
          <span>
            <span className="font-semibold">Watch out: </span>
            {r.pitfall}
          </span>
        </div>
      )}
      {(r.time || r.space) && (
        <div className="flex flex-wrap gap-2">
          {r.time && <Chip icon="Clock" color="var(--accent-3)">time {r.time}</Chip>}
          {r.space && <Chip icon="Layers" color="var(--accent-2)">space {r.space}</Chip>}
        </div>
      )}
    </div>
  );
}

/** The card on the problem page. */
export function RefresherPanel({ problem }: { problem: Problem }) {
  const hydrated = useHydrated();
  const solvedHere = useStore((s) => s.progress[problem.id]?.status === "solved");
  const lcDone = useLcSolved(problem.id);
  const [override, setOverride] = useState<boolean | null>(null);
  const r = refresherFor(problem);
  if (!r) return null;

  const done = hydrated && (solvedHere || lcDone);
  const open = override ?? done;

  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <Icon name="NotebookText" size={14} className="shrink-0 text-accent" />
          Quick refresher
          {done && <span className="truncate text-[11px] font-normal text-faint">you have solved this before</span>}
        </div>
        <button className="btn btn-ghost shrink-0 !py-1 !text-[11px]" onClick={() => setOverride(!open)}>
          <Icon name={open ? "EyeOff" : "Eye"} size={11} /> {open ? "Hide" : "Show"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <RefresherBody r={r} />
            </div>
          </motion.div>
        ) : (
          <div className="p-4 text-xs text-faint">
            A one-minute recap of how to solve it. Folded so it does not spoil a first attempt.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The small note button in a problem row; opens the refresher in a modal. */
export function RefresherButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const problem = PROBLEM_MAP[id];
  const r = problem ? refresherFor(problem) : null;
  if (!problem || !r) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cx("shrink-0 text-faint transition-colors hover:text-accent")}
        title="Quick refresher"
        aria-label={`Quick refresher for ${problem.title}`}
      >
        <Icon name="NotebookText" size={15} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={problem.title}>
        <RefresherBody r={r} />
        <div className="mt-4 flex justify-end border-t border-line-soft pt-3">
          <Link href={`/problems/${problem.id}`} className="btn !py-1.5 !text-xs" onClick={() => setOpen(false)}>
            Open the problem <Icon name="ArrowRight" size={12} />
          </Link>
        </div>
      </Modal>
    </>
  );
}

export { RefresherBody };
