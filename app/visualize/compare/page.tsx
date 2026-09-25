"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, DiffBadge, SectionTitle, cx } from "@/components/ui/bits";
import { VizCanvas } from "@/components/viz/renderers";
import { ALGO_MAP, ALGOS, runAlgo } from "@/lib/algo/registry";
import { TOPIC_MAP } from "@/lib/data/topics";
import { useStore } from "@/lib/store/useStore";
import type { VizAlgo } from "@/lib/types";

/**
 * Side by side racing. Two algorithms, one input, stepped in lockstep so the
 * difference in work is something you watch rather than read about.
 *
 * Step count is the honest metric here: it is the number of frames the
 * visualiser emits, which tracks the interesting operations (comparisons,
 * swaps, visits) but is not a wall-clock benchmark. The page says so.
 */

const PRESETS: { left: string; right: string; label: string }[] = [
  { left: "bubble-sort", right: "quick-sort", label: "Bubble vs Quick" },
  { left: "insertion-sort", right: "merge-sort", label: "Insertion vs Merge" },
  { left: "selection-sort", right: "heap-sort", label: "Selection vs Heap" },
  { left: "counting-sort", right: "quick-sort", label: "Counting vs Quick" },
  { left: "graph-bfs", right: "graph-dfs", label: "BFS vs DFS" },
  { left: "tree-traversal", right: "tree-bfs", label: "DFS vs level order" },
];

const SPEEDS = [0.5, 1, 1.5, 2, 3];

const byKind = (() => {
  const groups: Record<string, VizAlgo[]> = {};
  for (const a of ALGOS) (groups[a.kind] ??= []).push(a);
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
})();

export default function ComparePage() {
  const [leftSlug, setLeftSlug] = useState("bubble-sort");
  const [rightSlug, setRightSlug] = useState("quick-sort");

  const left = ALGO_MAP[leftSlug] ?? ALGOS[0];
  const right = ALGO_MAP[rightSlug] ?? ALGOS[1];

  const swap = () => {
    setLeftSlug(right.slug);
    setRightSlug(left.slug);
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <SectionTitle
        icon="Swords"
        title="Algorithm race"
        sub="Run two algorithms on the same input, one step at a time, and watch where the work actually goes."
        right={
          <Link href="/visualize" className="btn !py-1.5 !text-xs">
            <Icon name="ArrowLeft" size={12} /> All visualisers
          </Link>
        }
      />

      <div className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-faint">Classic matchups</span>
          {PRESETS.map((p) => {
            const active = p.left === leftSlug && p.right === rightSlug;
            return (
              <button
                key={p.label}
                onClick={() => {
                  setLeftSlug(p.left);
                  setRightSlug(p.right);
                }}
                className={cx("chip cursor-pointer transition-colors", active ? "border-accent text-accent" : "hover:border-accent/60")}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Picker label="Left" value={leftSlug} onChange={setLeftSlug} color="var(--accent)" />
          <button onClick={swap} className="btn !px-2.5 max-sm:w-full" aria-label="Swap sides">
            <Icon name="ArrowUpDown" size={14} className="sm:hidden" />
            <Icon name="MoveHorizontal" size={14} className="max-sm:hidden" />
          </button>
          <Picker label="Right" value={rightSlug} onChange={setRightSlug} color="var(--accent-2)" />
        </div>

        {left.kind !== right.kind && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--medium)]/40 bg-[var(--medium)]/10 p-2.5">
            <Icon name="Info" size={13} className="mt-0.5 shrink-0 text-medium" />
            <p className="text-[11px] leading-relaxed text-dim">
              These two take different input shapes ({left.kind} and {right.kind}). Each side falls back to its own
              default input, so the race still runs but the inputs are not identical.
            </p>
          </div>
        )}
      </div>

      {/* keyed so a new matchup resets the input and the step index cleanly */}
      <Race key={`${left.slug}|${right.slug}`} left={left} right={right} />
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  const algo = ALGO_MAP[value];
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
        <Icon name="PlayCircle" size={11} /> {label}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input !py-2 !text-sm">
        {byKind.map(([kind, list]) => (
          <optgroup key={kind} label={kind}>
            {list.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {algo && (
        <span className="mt-1 block truncate font-mono text-[10px] text-faint">
          {algo.complexity.time} time · {algo.complexity.space} space
        </span>
      )}
    </label>
  );
}

function Race({ left, right }: { left: VizAlgo; right: VizAlgo }) {
  const sameKind = left.kind === right.kind;
  const [input, setInput] = useState(left.defaultInput);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const timer = useRef<number | null>(null);
  const watchViz = useStore((s) => s.watchViz);

  const leftRun = useMemo(() => runAlgo(left, input), [left, input]);
  const rightRun = useMemo(() => runAlgo(right, sameKind ? input : right.defaultInput), [right, input, sameKind]);

  const maxLen = Math.max(leftRun.frames.length, rightRun.frames.length);
  const atEnd = idx >= maxLen - 1;

  const li = Math.min(idx, leftRun.frames.length - 1);
  const ri = Math.min(idx, rightRun.frames.length - 1);
  const leftFrame = leftRun.frames[li];
  const rightFrame = rightRun.frames[ri];

  useEffect(() => {
    if (!playing || atEnd) return;
    timer.current = window.setTimeout(() => {
      setIdx((i) => {
        const next = Math.min(maxLen - 1, i + 1);
        if (next === maxLen - 1) setPlaying(false);
        return next;
      });
    }, 460 / speed);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, idx, speed, atEnd, maxLen]);

  const play = useCallback(() => {
    watchViz(left.slug);
    watchViz(right.slug);
    if (atEnd) setIdx(0);
    setPlaying((p) => !p);
  }, [atEnd, left.slug, right.slug, watchViz]);

  const randomise = () => {
    const n = 8 + Math.floor(Math.random() * 6);
    const nums = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 60));
    setInput(nums.join(", "));
    setIdx(0);
    setPlaying(false);
  };

  const steps = { left: leftRun.frames.length, right: rightRun.frames.length };
  const winner = steps.left === steps.right ? null : steps.left < steps.right ? "left" : "right";
  const ratio = Math.max(steps.left, steps.right) / Math.max(1, Math.min(steps.left, steps.right));

  return (
    <div className="space-y-4">
      {/* input + transport */}
      <div className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[220px] flex-1">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-faint">
              Input {sameKind ? "(shared)" : `(left only — ${left.inputHint})`}
            </span>
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIdx(0);
                setPlaying(false);
              }}
              placeholder={left.defaultInput}
              className="input !py-2 font-mono !text-xs"
            />
          </label>
          <button onClick={randomise} className="btn !py-2 !text-xs">
            <Icon name="Dices" size={13} /> Randomise
          </button>
          <button
            onClick={() => {
              setInput(left.defaultInput);
              setIdx(0);
              setPlaying(false);
            }}
            className="btn !py-2 !text-xs"
          >
            <Icon name="RotateCcw" size={13} /> Default
          </button>
        </div>

        {(leftRun.error || rightRun.error) && (
          <p className="text-[11px] text-medium">{leftRun.error ?? rightRun.error}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setIdx(0)} className="btn !px-2" aria-label="Restart">
            <Icon name="SkipBack" size={14} />
          </button>
          <button onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} className="btn !px-2" aria-label="Step back">
            <Icon name="ChevronLeft" size={14} />
          </button>
          <button onClick={play} className="btn btn-primary !px-4">
            <Icon name={playing ? "Pause" : atEnd ? "RotateCcw" : "Play"} size={14} />
            {playing ? "Pause" : atEnd ? "Replay" : "Race"}
          </button>
          <button onClick={() => { setPlaying(false); setIdx((i) => Math.min(maxLen - 1, i + 1)); }} className="btn !px-2" aria-label="Step forward">
            <Icon name="ChevronRight" size={14} />
          </button>
          <button onClick={() => { setPlaying(false); setIdx(maxLen - 1); }} className="btn !px-2" aria-label="Jump to end">
            <Icon name="SkipForward" size={14} />
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(0, maxLen - 1)}
            value={idx}
            onChange={(e) => {
              setPlaying(false);
              setIdx(Number(e.target.value));
            }}
            className="min-w-[140px] flex-1 accent-[var(--accent)]"
            aria-label="Scrub"
          />
          <span className="font-mono text-[11px] text-faint">
            {idx + 1} / {maxLen}
          </span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="input !w-auto !py-1.5 !text-xs">
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* the race track */}
      <div className="panel space-y-3 p-4">
        <Track algo={left} color="var(--accent)" at={li} total={steps.left} done={li >= steps.left - 1} />
        <Track algo={right} color="var(--accent-2)" at={ri} total={steps.right} done={ri >= steps.right - 1} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-[11px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={winner ?? "tie"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold"
            >
              {winner === null ? (
                <span className="text-dim">Dead heat: both take {steps.left} steps on this input.</span>
              ) : (
                <span style={{ color: winner === "left" ? "var(--accent)" : "var(--accent-2)" }}>
                  {(winner === "left" ? left : right).name} finishes in {Math.min(steps.left, steps.right)} steps,{" "}
                  {ratio.toFixed(1)}x fewer than {(winner === "left" ? right : left).name}.
                </span>
              )}
            </motion.span>
          </AnimatePresence>
          <span className="text-faint">
            Steps are animation frames, so they track comparisons and visits rather than nanoseconds.
          </span>
        </div>
      </div>

      {/* the two canvases */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Side algo={left} frame={leftFrame} color="var(--accent)" step={li} total={steps.left} />
        <Side algo={right} frame={rightFrame} color="var(--accent-2)" step={ri} total={steps.right} />
      </div>
    </div>
  );
}

function Track({
  algo,
  color,
  at,
  total,
  done,
}: {
  algo: VizAlgo;
  color: string;
  at: number;
  total: number;
  done: boolean;
}) {
  const frac = total > 1 ? at / (total - 1) : 1;
  const pct = frac * 100;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px]">
        <span className="font-semibold" style={{ color }}>
          {algo.name}
        </span>
        <span className="font-mono text-faint">{algo.complexity.time}</span>
        {done && (
          <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-easy">
            <Icon name="Flag" size={10} /> done
          </motion.span>
        )}
        <span className="ml-auto font-mono text-faint">
          {at + 1} / {total}
        </span>
      </div>
      <div className="relative">
        <Bar value={frac} color={color} height={8} />
        <motion.span
          className="absolute top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border-2 shadow"
          style={{ borderColor: color, background: "var(--bg-elev)", left: `calc(${pct}% - 10px)` }}
          animate={{ scale: done ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Icon name={done ? "Check" : "Zap"} size={10} style={{ color }} />
        </motion.span>
      </div>
    </div>
  );
}

function Side({
  algo,
  frame,
  color,
  step,
  total,
}: {
  algo: VizAlgo;
  frame: { note: string; state: Record<string, unknown>; metrics?: Record<string, number | string> };
  color: string;
  step: number;
  total: number;
}) {
  const topic = TOPIC_MAP[algo.topic];
  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex items-center gap-2 px-4 py-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
          <Icon name={topic?.icon ?? "PlayCircle"} size={14} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{algo.name}</div>
          <div className="font-mono text-[10px] text-faint">
            {algo.complexity.time} · {algo.complexity.space}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <DiffBadge d={algo.difficulty} small />
          <Chip color={color}>
            {step + 1}/{total}
          </Chip>
        </div>
      </div>

      <div className="min-h-[220px] p-3">
        <VizCanvas kind={algo.kind} frame={frame} />
      </div>

      {frame.metrics && Object.keys(frame.metrics).length > 0 && (
        <div className="hairline flex flex-wrap gap-x-4 gap-y-1 px-4 py-2">
          {Object.entries(frame.metrics).map(([k, v]) => (
            <span key={k} className="text-[10px]">
              <span className="text-faint">{k} </span>
              <span className="font-mono font-bold">{v}</span>
            </span>
          ))}
        </div>
      )}

      <div className="px-4 py-2.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={frame.note}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="text-xs leading-relaxed text-dim"
          >
            {frame.note}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="hairline flex items-center justify-between px-4 py-2">
        <Link href={`/visualize/${algo.slug}`} className="flex items-center gap-1 text-[10px] text-faint hover:text-accent">
          <Icon name="Maximize2" size={10} /> Open on its own
        </Link>
        <span className="text-[10px] text-faint">{algo.tags?.slice(0, 2).join(" · ")}</span>
      </div>
    </div>
  );
}
