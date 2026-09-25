"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Problem } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Chip, Modal, cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { platformLinks } from "@/lib/data/problems";

/* -------------------------------- hint ladder ------------------------------ */

export function HintLadder({ problem }: { problem: Problem }) {
  const hydrated = useHydrated();
  const used = useStore((s) => s.progress[problem.id]?.usedHints) ?? 0;
  const revealHint = useStore((s) => s.useHint);
  const expandFirst = useStore((s) => s.settings.showHintsFirst);

  // bespoke hints, else the hint ladder of the first pattern
  const hints =
    problem.hints ??
    problem.patterns.flatMap((p) => PATTERN_MAP[p]?.hints ?? []).slice(0, 3);

  if (!hints.length) return null;
  const open = hydrated ? (expandFirst ? hints.length : used) : 0;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="Lightbulb" size={14} className="text-gold" /> Hints
        </div>
        <span className="text-[10px] text-faint">
          {open} of {hints.length} revealed
          {open > 0 && " · XP reduced"}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {hints.map((h, i) => {
          const shown = i < open;
          return (
            <div key={i}>
              {shown ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden rounded-xl border border-gold/30 bg-gold/[0.07] px-3 py-2.5"
                >
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gold">Hint {i + 1}</div>
                  <p className="text-[12.5px] leading-relaxed">{h}</p>
                </motion.div>
              ) : i === open ? (
                <button
                  onClick={() => revealHint(problem.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-dashed border-line px-3 py-2.5 text-left text-xs text-dim transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <span>Reveal hint {i + 1}</span>
                  <Icon name="Eye" size={13} />
                </button>
              ) : (
                <div className="rounded-xl border border-dashed border-line-soft px-3 py-2.5 text-xs text-faint">
                  Hint {i + 1} locked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- approach reveal --------------------------- */

export function ApproachPanel({ problem }: { problem: Problem }) {
  const [shown, setShown] = useState(false);
  const pattern = problem.patterns[0] ? PATTERN_MAP[problem.patterns[0]] : undefined;

  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="Wand2" size={14} className="text-accent" /> Approach
        </div>
        <button className="btn btn-ghost !py-1 !text-[11px]" onClick={() => setShown((v) => !v)}>
          <Icon name={shown ? "EyeOff" : "Eye"} size={11} /> {shown ? "Hide" : "Reveal"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {shown ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4">
              {problem.approach && <p className="text-sm leading-relaxed">{problem.approach}</p>}
              <div className="flex flex-wrap gap-2">
                {problem.time && <Chip icon="Clock" color="var(--accent-3)">time {problem.time}</Chip>}
                {problem.space && <Chip icon="Layers" color="var(--accent-2)">space {problem.space}</Chip>}
              </div>
              {problem.followUp && (
                <div className="rounded-xl border border-line-soft bg-panel-2/60 p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-faint">Expect this follow-up</div>
                  <p className="text-xs leading-relaxed text-dim">{problem.followUp}</p>
                </div>
              )}
              {pattern && (
                <div>
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">
                    Template: {pattern.name}
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-line-soft bg-panel-2 p-3 font-mono text-[11px] leading-relaxed">
                    {pattern.template}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="p-4 text-xs text-faint">
            Try it first. Revealing the approach does not cost XP, but solving it unaided is worth more.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ platform links ----------------------------- */

const PLATFORM_ICON: Record<string, string> = {
  LeetCode: "Code2",
  GeeksforGeeks: "BookOpen",
  Code360: "Braces",
  InterviewBit: "ListChecks",
  HackerRank: "Cpu",
  CodeChef: "Trophy",
  "Editorial video": "PlayCircle",
};

export function PlatformLinks({ problem }: { problem: Problem }) {
  const links = platformLinks(problem);
  return (
    <div className="panel p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold">
        <Icon name="ExternalLink" size={14} className="text-accent-3" /> Solve it on
      </div>
      <p className="mb-3 text-[11px] leading-snug text-faint">
        Direct links where the exact problem id is known, search links otherwise. The same question often appears under a
        different title on each platform.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {links.map((l) => (
          <a
            key={l.platform}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className={cx(
              "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs transition-colors",
              l.exact ? "border-line hover:border-accent/60" : "border-dashed border-line-soft hover:border-line",
            )}
          >
            <Icon name={PLATFORM_ICON[l.platform] ?? "ExternalLink"} size={13} className={l.exact ? "text-accent" : "text-faint"} />
            <span className="min-w-0 flex-1 truncate">{l.platform}</span>
            {l.note && <span className="shrink-0 text-[9px] text-faint">{l.note}</span>}
            {!l.exact && <span className="shrink-0 text-[9px] text-faint">search</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- notes ---------------------------------- */

export function NotesPanel({ problemId }: { problemId: string }) {
  const hydrated = useHydrated();
  return hydrated ? <Notes key={problemId} problemId={problemId} /> : <NotesShell />;
}

function NotesShell() {
  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Icon name="StickyNote" size={14} className="text-medium" /> Your notes
      </div>
      <div className="h-[116px] rounded-xl bg-panel-2" />
    </div>
  );
}

function Notes({ problemId }: { problemId: string }) {
  const stored = useStore((s) => s.progress[problemId]?.notes) ?? "";
  const setNote = useStore((s) => s.setNote);
  const [value, setValue] = useState(() => stored);
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="StickyNote" size={14} className="text-medium" /> Your notes
        </div>
        <AnimatePresence>
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-easy">
              saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            setNote(problemId, e.target.value);
            setSaved(true);
            setTimeout(() => setSaved(false), 1400);
          }, 600);
        }}
        rows={5}
        placeholder="What was the key insight? What did you get wrong the first time? Future you will read this the night before the interview."
        className="input resize-y font-normal"
      />
    </div>
  );
}

/* --------------------------------- timer ---------------------------------- */

export function SolveBar({ problem }: { problem: Problem }) {
  const hydrated = useHydrated();
  const prog = useStore((s) => s.progress[problem.id]);
  const markStatus = useStore((s) => s.markStatus);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [askConfidence, setAskConfidence] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const over = seconds > problem.est * 60;
  const status = hydrated ? (prog?.status ?? "todo") : "todo";

  return (
    <>
      <div className="panel sticky bottom-20 z-30 flex flex-wrap items-center gap-2 p-3 lg:bottom-4">
        <button
          className={cx("btn !px-3", running && "!border-hard !text-hard")}
          onClick={() => setRunning((r) => !r)}
        >
          <Icon name={running ? "Pause" : "Timer"} size={14} />
          <span className={cx("font-mono", over && "text-medium")}>
            {mm}:{ss}
          </span>
        </button>
        <span className="text-[11px] text-faint">
          target {problem.est}m{over ? " · over, that is fine, note why" : ""}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            className={cx("btn !text-xs", status === "attempted" && "!border-medium !text-medium")}
            onClick={() => markStatus(problem.id, "attempted", { seconds })}
          >
            <Icon name="CircleDot" size={13} /> Attempted
          </button>
          <button
            className={cx("btn !text-xs", status === "revisit" && "!border-hard !text-hard")}
            onClick={() => markStatus(problem.id, "revisit", { seconds })}
          >
            <Icon name="Flag" size={13} /> Revisit
          </button>
          <button
            className={cx("btn !text-xs", status === "solved" ? "!border-easy !text-easy" : "btn-primary")}
            onClick={() => {
              setRunning(false);
              if (status === "solved") markStatus(problem.id, "todo");
              else setAskConfidence(true);
            }}
          >
            <Icon name="CheckCircle2" size={13} /> {status === "solved" ? "Solved" : "Mark solved"}
          </button>
        </div>
      </div>

      <Modal open={askConfidence} onClose={() => setAskConfidence(false)} title="How did that go?">
        <p className="text-sm text-dim">
          Your answer sets the first spaced-repetition interval and feeds the knowledge-tracing model. Be honest, the
          schedule only works if the signal is real.
        </p>
        <div className="mt-4 grid gap-2">
          {[
            { v: 5, label: "Clean and fast", body: "Optimal solution, no hints, no bugs. Long interval.", color: "var(--easy)" },
            { v: 4, label: "Solid", body: "Got there with minor stumbles.", color: "#8ce7ff" },
            { v: 3, label: "Rough", body: "Needed a hint or a long think. Shorter interval.", color: "var(--medium)" },
            { v: 2, label: "Barely", body: "Looked at the approach, then implemented it. See it again soon.", color: "var(--hard)" },
          ].map((o) => (
            <button
              key={o.v}
              className="flex items-start gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-accent/60"
              onClick={() => {
                markStatus(problem.id, "solved", { confidence: o.v, seconds });
                setAskConfidence(false);
              }}
            >
              <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: o.color }} />
              <span>
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-[11px] text-faint">{o.body}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
