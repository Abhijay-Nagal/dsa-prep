"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { buzz, play } from "@/lib/sound";
import type { Problem } from "@/lib/types";

/**
 * A timed round with phase coaching. Solving problems untimed teaches the
 * algorithm but not the interview: candidates lose rounds by spending twenty
 * minutes silently coding before mentioning a brute force. The phases here are
 * the shape of a real 45 minute round, scaled to the problem's target time.
 */

interface Phase {
  /** Fraction of the target time at which this phase begins. */
  from: number;
  name: string;
  icon: string;
  color: string;
  prompt: string;
}

const PHASES: Phase[] = [
  {
    from: 0,
    name: "Clarify",
    icon: "Info",
    color: "var(--accent-3)",
    prompt: "Restate the problem in your own words. Ask about input size, duplicates, empty input and what exactly to return.",
  },
  {
    from: 0.1,
    name: "Plan out loud",
    icon: "Lightbulb",
    color: "var(--gold)",
    prompt: "Name a brute force and give its complexity. Then say which pattern you think applies and why. Do not start typing yet.",
  },
  {
    from: 0.25,
    name: "Code",
    icon: "Code2",
    color: "var(--accent)",
    prompt: "Write it, narrating as you go. Keep the invariant you stated true at every step.",
  },
  {
    from: 0.72,
    name: "Verify",
    icon: "CheckCheck",
    color: "var(--easy)",
    prompt: "Dry run the smallest interesting input by hand. Then walk the edge cases you listed at the start.",
  },
  {
    from: 0.92,
    name: "Wrap up",
    icon: "Flag",
    color: "var(--accent-2)",
    prompt: "State the final time and space complexity, and name one follow-up you would handle with more time.",
  },
];

const phaseAt = (frac: number): Phase => {
  let cur = PHASES[0];
  for (const p of PHASES) if (frac >= p.from) cur = p;
  return cur;
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function InterviewMode({ problem }: { problem: Problem }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const accumulated = useRef(0);

  const markStatus = useStore((s) => s.markStatus);
  const sound = useStore((s) => s.settings.sound);

  const target = problem.est * 60;
  const frac = target > 0 ? elapsed / target : 0;
  const phase = phaseAt(frac);
  const over = elapsed > target;

  /* Wall-clock driven so a throttled background tab does not lose time. */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed(accumulated.current + (Date.now() - startedAt.current) / 1000);
    }, 500);
    return () => window.clearInterval(id);
  }, [running]);

  /* One chime as each phase opens, so you can keep your eyes on the code. */
  const lastPhase = useRef(phase.name);
  useEffect(() => {
    if (!running) return;
    if (lastPhase.current !== phase.name) {
      lastPhase.current = phase.name;
      play("tick", sound);
      buzz(10);
    }
  }, [phase.name, running, sound]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setRunning(true);
    play("start", sound);
  }, [sound]);

  const pause = useCallback(() => {
    accumulated.current += (Date.now() - startedAt.current) / 1000;
    setRunning(false);
    play("click", sound);
  }, [sound]);

  const reset = useCallback(() => {
    accumulated.current = 0;
    startedAt.current = 0;
    setElapsed(0);
    setRunning(false);
    lastPhase.current = PHASES[0].name;
  }, []);

  const finish = useCallback(
    (solved: boolean) => {
      const seconds = Math.round(running ? accumulated.current + (Date.now() - startedAt.current) / 1000 : accumulated.current);
      markStatus(problem.id, solved ? "solved" : "attempted", { seconds, confidence: solved ? (over ? 2 : 3) : 1 });
      reset();
    },
    [markStatus, over, problem.id, reset, running],
  );

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-panel-2/40"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Icon name="Timer" size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Interview mode</span>
          <span className="block text-[11px] text-faint">
            {running ? `Running · ${clock(elapsed)} · ${phase.name}` : `A timed ${problem.est} minute round with phase prompts`}
          </span>
        </span>
        {running && (
          <motion.span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: over ? "var(--hard)" : phase.color }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="shrink-0 text-faint" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="hairline space-y-3.5 p-4">
              {/* clock */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={cx("font-mono text-3xl font-extrabold tabular-nums", over && "text-hard")}>
                    {clock(elapsed)}
                  </span>
                  <span className="font-mono text-xs text-faint">/ {clock(target)}</span>
                </div>
                <div className="ml-auto flex flex-wrap gap-1.5">
                  <button onClick={running ? pause : start} className="btn btn-primary !py-1.5 !text-xs">
                    <Icon name={running ? "Pause" : "Play"} size={12} />
                    {running ? "Pause" : elapsed > 0 ? "Resume" : "Start round"}
                  </button>
                  <button onClick={reset} disabled={elapsed === 0} className="btn !px-2 !py-1.5" aria-label="Reset">
                    <Icon name="RotateCcw" size={12} />
                  </button>
                </div>
              </div>

              <div>
                <Bar value={Math.min(1, frac)} color={over ? "var(--hard)" : phase.color} height={7} />
                {/* phase ticks */}
                <div className="relative mt-1 h-3">
                  {PHASES.map((p) => (
                    <span
                      key={p.name}
                      className="absolute -translate-x-1/2 text-[9px]"
                      style={{ left: `${p.from * 100}%`, color: frac >= p.from ? p.color : "var(--faint)" }}
                    >
                      |
                    </span>
                  ))}
                </div>
              </div>

              {/* current phase coaching */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={over ? "over" : phase.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-2.5 rounded-xl border p-3"
                  style={{
                    borderColor: over ? "var(--hard)" : phase.color,
                    background: `color-mix(in srgb, ${over ? "var(--hard)" : phase.color} 10%, transparent)`,
                  }}
                >
                  <Icon name={over ? "AlertTriangle" : phase.icon} size={15} className="mt-0.5 shrink-0" style={{ color: over ? "var(--hard)" : phase.color }} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold" style={{ color: over ? "var(--hard)" : phase.color }}>
                      {over ? "Over target" : phase.name}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-dim">
                      {over
                        ? "In a real round you would be asked to wrap up. Finish the thought, state what is left, and log it honestly."
                        : phase.prompt}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* the whole script, so you know what is coming */}
              <div className="grid gap-1.5 sm:grid-cols-2">
                {PHASES.map((p) => {
                  const active = p.name === phase.name && !over;
                  const passed = frac > p.from && !active;
                  return (
                    <div
                      key={p.name}
                      className={cx(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors",
                        active ? "border-transparent" : "border-line",
                      )}
                      style={active ? { background: `color-mix(in srgb, ${p.color} 16%, transparent)` } : undefined}
                    >
                      <Icon
                        name={passed ? "Check" : p.icon}
                        size={11}
                        style={{ color: passed ? "var(--easy)" : active ? p.color : "var(--faint)" }}
                      />
                      <span className={cx("flex-1 truncate", active ? "font-semibold" : "text-dim")}>{p.name}</span>
                      <span className="font-mono text-[10px] text-faint">{clock(p.from * target)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-line-soft pt-3">
                <button onClick={() => finish(true)} disabled={elapsed === 0} className="btn btn-primary !py-1.5 !text-xs">
                  <Icon name="CheckCircle2" size={12} /> Solved it
                </button>
                <button onClick={() => finish(false)} disabled={elapsed === 0} className="btn !py-1.5 !text-xs">
                  <Icon name="Flag" size={12} /> Log as attempted
                </button>
                <span className="ml-auto self-center text-[10px] text-faint">
                  Time is recorded either way and feeds the planner
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
