"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { VizAlgo } from "@/lib/types";
import { runAlgo } from "@/lib/algo/registry";
import { VizCanvas } from "./renderers";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge, cx } from "@/components/ui/bits";
import { PROBLEM_MAP } from "@/lib/data/problems";
import { useStore } from "@/lib/store/useStore";

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 3, 5];

export function VizPlayer({ algo }: { algo: VizAlgo }) {
  const [input, setInput] = useState(algo.defaultInput);
  const [draft, setDraft] = useState(algo.defaultInput);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const storedSpeed = useStore((s) => s.settings.vizSpeed);
  const setSetting = useStore((s) => s.setSetting);
  const watchViz = useStore((s) => s.watchViz);
  const [speed, setSpeed] = useState(storedSpeed || 1);
  const [showCode, setShowCode] = useState(true);
  const timer = useRef<number | null>(null);

  const { frames, error } = useMemo(() => runAlgo(algo, input), [algo, input]);
  const frame = frames[Math.min(idx, frames.length - 1)];
  const atEnd = idx >= frames.length - 1;

  useEffect(() => {
    if (!playing || atEnd) return;
    timer.current = window.setTimeout(() => {
      setIdx((i) => {
        const next = Math.min(frames.length - 1, i + 1);
        if (next === frames.length - 1) setPlaying(false);
        return next;
      });
    }, 620 / speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, idx, speed, atEnd, frames.length]);

  const play = useCallback(() => {
    watchViz(algo.slug);
    if (atEnd) setIdx(0);
    setPlaying((p) => !p);
  }, [algo.slug, atEnd, watchViz]);

  const step = useCallback(
    (d: number) => {
      setPlaying(false);
      setIdx((i) => Math.max(0, Math.min(frames.length - 1, i + d)));
    },
    [frames.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); play(); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "r") { setIdx(0); setPlaying(false); }
      if (e.key === "0") setIdx(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, play]);

  const lines = Array.isArray(frame?.line) ? frame.line : frame?.line !== undefined ? [frame.line] : [];
  const related = (algo.related ?? []).map((id) => PROBLEM_MAP[id]).filter(Boolean);

  const apply = () => {
    setInput(draft);
    setIdx(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{algo.name}</h1>
            <DiffBadge d={algo.difficulty} />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-dim">{algo.blurb}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {algo.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </div>
        <div className="panel grid shrink-0 gap-1 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={12} className="text-accent-3" />
            <span className="text-faint">Time</span>
            <span className="font-mono font-bold">{algo.complexity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Layers" size={12} className="text-accent-2" />
            <span className="text-faint">Space</span>
            <span className="font-mono font-bold">{algo.complexity.space}</span>
          </div>
        </div>
      </div>

      {/* input */}
      <div className="panel flex flex-wrap items-center gap-2 p-3">
        <Icon name="Keyboard" size={14} className="text-faint" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">Input</span>
        {algo.defaultInput.includes("\n") ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(6, draft.split("\n").length + 1)}
            className="input min-w-[220px] flex-1 font-mono text-xs"
            spellCheck={false}
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="input min-w-[220px] flex-1 font-mono text-xs"
            spellCheck={false}
          />
        )}
        <button className="btn btn-primary" onClick={apply}>
          <Icon name="Play" size={13} /> Run
        </button>
        <button
          className="btn"
          onClick={() => {
            setDraft(algo.defaultInput);
            setInput(algo.defaultInput);
            setIdx(0);
          }}
        >
          <Icon name="RotateCcw" size={13} /> Reset
        </button>
        <span className="w-full text-[11px] text-faint sm:w-auto">{algo.inputHint}</span>
        {error && <span className="text-[11px] text-medium">{error}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* stage */}
        <div className="panel overflow-hidden">
          <div className="min-h-[340px] sm:min-h-[420px]">{frame && <VizCanvas kind={algo.kind} frame={frame} />}</div>

          {/* narration */}
          <div className="hairline border-t px-4 py-3" style={{ borderTopWidth: 1 }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="min-h-[2.5rem] text-sm leading-relaxed"
              >
                {frame?.note}
              </motion.p>
            </AnimatePresence>
            {frame?.metrics && Object.keys(frame.metrics).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(frame.metrics).map(([k, v]) => (
                  <span key={k} className="chip !text-[10px]">
                    {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                    <b className="ml-1 font-mono text-text">{v}</b>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center gap-2 border-t border-line-soft px-3 py-2.5">
            <button className="btn !px-2" onClick={() => { setIdx(0); setPlaying(false); }} title="Restart (r)">
              <Icon name="SkipBack" size={15} />
            </button>
            <button className="btn !px-2" onClick={() => step(-1)} title="Step back (left arrow)">
              <Icon name="Rewind" size={15} />
            </button>
            <button
              className="btn btn-primary !px-4"
              onClick={play}
              title="Play / pause (space)"
            >
              <Icon name={playing ? "Pause" : "Play"} size={15} />
              {playing ? "Pause" : atEnd ? "Replay" : "Play"}
            </button>
            <button className="btn !px-2" onClick={() => step(1)} title="Step forward (right arrow)">
              <Icon name="FastForward" size={15} />
            </button>
            <button className="btn !px-2" onClick={() => { setIdx(frames.length - 1); setPlaying(false); }} title="Jump to end">
              <Icon name="SkipForward" size={15} />
            </button>

            <div className="ml-1 flex items-center gap-1.5">
              <Icon name="Gauge" size={13} className="text-faint" />
              <select
                value={speed}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSpeed(v);
                  setSetting("vizSpeed", v);
                }}
                className="rounded-lg border border-line bg-panel-2 px-1.5 py-1 font-mono text-[11px]"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}x
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2 font-mono text-[11px] text-faint">
              {idx + 1} / {frames.length}
            </div>
          </div>

          {/* scrubber */}
          <div className="px-3 pb-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={idx}
              onChange={(e) => {
                setPlaying(false);
                setIdx(Number(e.target.value));
              }}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>

        {/* side: pseudocode + notes */}
        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
              onClick={() => setShowCode((v) => !v)}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="Code2" size={14} className="text-accent" /> Pseudocode
              </span>
              <Icon name={showCode ? "ChevronUp" : "ChevronDown"} size={14} className="text-faint" />
            </button>
            {showCode && (
              <div className="border-t border-line-soft p-3 font-mono text-[11.5px] leading-relaxed">
                {algo.pseudocode.map((l, i) => {
                  const active = lines.includes(i);
                  return (
                    <div
                      key={i}
                      className={cx(
                        "relative whitespace-pre rounded px-2 py-0.5 transition-colors",
                        active ? "font-semibold" : "text-dim",
                      )}
                      style={active ? { background: "var(--accent-soft)", color: "var(--text)" } : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="code-line"
                          className="absolute inset-y-0 left-0 w-0.5 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                      )}
                      {l}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {algo.complexity.note && (
            <div className="panel p-4">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                <Icon name="Lightbulb" size={14} className="text-gold" /> Why it matters
              </div>
              <p className="text-xs leading-relaxed text-dim">{algo.complexity.note}</p>
            </div>
          )}

          {related.length > 0 && (
            <div className="panel p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Icon name="ListOrdered" size={14} className="text-accent-3" /> Practise this
              </div>
              <div className="space-y-1.5">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/problems/${p.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-panel-2"
                  >
                    <span className="truncate">{p.title}</span>
                    <DiffBadge d={p.difficulty} small />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="panel p-3 text-[11px] text-faint">
            <div className="mb-1 font-semibold text-dim">Keyboard</div>
            <div className="grid grid-cols-2 gap-1">
              <span>space play</span>
              <span>← → step</span>
              <span>r restart</span>
              <span>ctrl K search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
