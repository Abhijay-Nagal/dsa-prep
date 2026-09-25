"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, DiffBadge, Ring, Segmented, cx } from "@/components/ui/bits";
import { COMPLEXITY_QUESTIONS, PATTERN_QUESTIONS, shuffle } from "@/lib/data/quiz";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { COMPANIES, COMPANY_MAP } from "@/lib/data/companies";
import { companySheet } from "@/lib/engine/readiness";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { useSnapshot } from "@/hooks/useLearner";
import type { Problem } from "@/lib/types";

type Mode = "mock" | "pattern" | "complexity";

export default function ArenaPage() {
  const [mode, setMode] = useState<Mode>("mock");
  const wins = useStore((s) => s.arenaWins);
  const bestQuiz = useStore((s) => s.bestQuiz);
  const hydrated = useHydrated();

  return (
    <div className="mx-auto max-w-[1000px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
            The <span className="grad-text">arena</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-dim">
            Knowing the pattern is not the same as recognising it under time pressure. These drills train the recognition
            and the clock.
          </p>
        </div>
        <div className="flex gap-2">
          <Chip icon="Trophy" color="var(--gold)">
            {hydrated ? wins : 0} wins
          </Chip>
          <Chip icon="BadgeCheck" color="var(--easy)">
            best quiz {hydrated ? bestQuiz : 0}%
          </Chip>
        </div>
      </div>

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: "mock", label: "Mock round", icon: "Timer" },
          { value: "pattern", label: "Pattern sprint", icon: "Wand2" },
          { value: "complexity", label: "Complexity drill", icon: "Gauge" },
        ]}
      />

      {mode === "mock" && <MockRound />}
      {mode === "pattern" && <PatternSprint />}
      {mode === "complexity" && <ComplexityDrill />}
    </div>
  );
}

/* ============================================================
   Mock interview round
   ============================================================ */

function MockRound() {
  const snap = useSnapshot();
  const target = useStore((s) => s.settings.targetCompany);
  const markStatus = useStore((s) => s.markStatus);
  const recordArenaWin = useStore((s) => s.recordArenaWin);
  const [company, setCompany] = useState(target ?? "google");
  const [minutes, setMinutes] = useState(45);
  const [count, setCount] = useState(2);
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(0);
  const [picked, setPicked] = useState<Problem[]>([]);
  const [results, setResults] = useState<Record<string, "solved" | "failed">>({});

  const start = useCallback(() => {
    const c = COMPANY_MAP[company];
    const pool = companySheet(c).filter((p) => snap.progress[p.id]?.status !== "solved");
    const fallback = companySheet(c);
    const source = pool.length >= count ? pool : fallback;
    // weight toward their real difficulty mix
    const wanted: Problem[] = [];
    const byDiff = {
      Easy: source.filter((p) => p.difficulty === "Easy"),
      Medium: source.filter((p) => p.difficulty === "Medium"),
      Hard: source.filter((p) => p.difficulty === "Hard"),
    };
    const order: ("Easy" | "Medium" | "Hard")[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 100;
      order.push(r < c.mix.easy ? "Easy" : r < c.mix.easy + c.mix.medium ? "Medium" : "Hard");
    }
    for (const d of order) {
      const list = byDiff[d].length ? byDiff[d] : source;
      const pick = list[Math.floor(Math.random() * list.length)];
      if (pick && !wanted.some((w) => w.id === pick.id)) wanted.push(pick);
    }
    while (wanted.length < count && source.length) {
      const pick = source[Math.floor(Math.random() * source.length)];
      if (!wanted.some((w) => w.id === pick.id)) wanted.push(pick);
    }
    setPicked(wanted);
    setResults({});
    setLeft(minutes * 60);
    setStarted(true);
  }, [company, count, minutes, snap]);

  useEffect(() => {
    if (!started || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [started, left]);

  const solvedN = Object.values(results).filter((r) => r === "solved").length;
  const done = Object.keys(results).length === picked.length && picked.length > 0;
  const finished = started && (done || left <= 0);

  /** Records one outcome and banks a win when that was the last problem. */
  const mark = (id: string, outcome: "solved" | "failed") => {
    const next = { ...results, [id]: outcome };
    setResults(next);
    if (outcome === "solved") markStatus(id, "solved", { confidence: 4 });
    else markStatus(id, "attempted");
    const solvedAll = Object.values(next).filter((r) => r === "solved").length === picked.length;
    if (Object.keys(next).length === picked.length && solvedAll) recordArenaWin();
  };

  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");
  const c = COMPANY_MAP[company];

  if (!started) {
    return (
      <div className="panel space-y-4 p-5">
        <div>
          <h2 className="text-lg font-bold">Set up the round</h2>
          <p className="mt-1 text-sm text-dim">
            Problems are drawn from the company sheet and weighted to their real difficulty mix. The clock does not stop.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Company</span>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="input !text-sm">
              {COMPANIES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Duration</span>
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="input !text-sm">
              {[20, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Problems</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="input !text-sm">
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-line-soft bg-panel-2/50 p-3.5">
          <div className="text-xs font-bold">{c.name} bar</div>
          <p className="mt-1 text-[11.5px] leading-snug text-dim">{c.bar}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip color="var(--easy)">{c.mix.easy}% easy</Chip>
            <Chip color="var(--medium)">{c.mix.medium}% medium</Chip>
            <Chip color="var(--hard)">{c.mix.hard}% hard</Chip>
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={start}>
          <Icon name="Play" size={14} /> Start the round
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-4 p-4">
        <Ring value={minutes ? left / (minutes * 60) : 0} size={72} stroke={7} color={left < 300 ? "var(--hard)" : "var(--accent)"}>
          <span className={cx("font-mono text-sm font-bold", left < 300 && "text-hard")}>
            {mm}:{ss}
          </span>
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{c.name} round in progress</div>
          <p className="text-[11px] text-faint">
            Solve on paper or in your editor. Mark each one honestly when the clock runs out.
          </p>
          <div className="mt-2">
            <Bar value={picked.length ? Object.keys(results).length / picked.length : 0} height={4} />
          </div>
        </div>
        <button className="btn" onClick={() => setStarted(false)}>
          <Icon name="X" size={13} /> Abandon
        </button>
      </div>

      {picked.map((p, i) => {
        const r = results[p.id];
        return (
          <div key={p.id} className="panel p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-panel-2 font-mono text-[11px]">{i + 1}</span>
              <Link href={`/problems/${p.id}`} className="text-sm font-bold hover:text-accent">
                {p.title}
              </Link>
              <DiffBadge d={p.difficulty} />
              <Chip icon="Clock">{p.est}m target</Chip>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={cx("btn !text-xs", r === "solved" && "!border-easy !text-easy")}
                onClick={() => mark(p.id, "solved")}
              >
                <Icon name="Check" size={12} /> Solved it
              </button>
              <button
                className={cx("btn !text-xs", r === "failed" && "!border-hard !text-hard")}
                onClick={() => mark(p.id, "failed")}
              >
                <Icon name="X" size={12} /> Did not finish
              </button>
              <Link href={`/problems/${p.id}`} className="btn btn-ghost !text-xs">
                Open <Icon name="ArrowRight" size={12} />
              </Link>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
            <div className="flex items-center gap-3">
              <Icon
                name={solvedN === picked.length ? "Trophy" : solvedN > 0 ? "Medal" : "AlertTriangle"}
                size={22}
                className={solvedN === picked.length ? "text-gold" : solvedN > 0 ? "text-accent-3" : "text-hard"}
              />
              <div>
                <div className="text-lg font-bold">
                  {solvedN} of {picked.length} solved
                </div>
                <p className="text-xs text-dim">
                  {solvedN === picked.length
                    ? `That clears the ${c.name} bar for this round. Do it again with a shorter clock.`
                    : left <= 0
                      ? "Time ran out. In a real loop, a partial solution with clear communication still scores."
                      : "Note what blocked you, then look at the pattern page for the one you missed."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" onClick={start}>
                <Icon name="RotateCcw" size={13} /> Another round
              </button>
              <button className="btn" onClick={() => setStarted(false)}>
                Change setup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Pattern sprint
   ============================================================ */

function PatternSprint() {
  const recordArenaWin = useStore((s) => s.recordArenaWin);
  const pushToast = useStore((s) => s.pushToast);
  const [seed, setSeed] = useState(() => Math.random());
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [left, setLeft] = useState(90);

  const questions = useMemo(() => shuffle(PATTERN_QUESTIONS, seed).slice(0, 12), [seed]);
  const q = questions[i];
  const options = useMemo(() => (q ? shuffle([q.answer, ...q.decoys], seed + i) : []), [q, seed, i]);
  const over = left <= 0 || i >= questions.length;

  useEffect(() => {
    if (over) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, over]);

  const answer = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const right = opt === q.answer;
    const finalScore = score + (right ? 1 : 0);
    if (right) {
      setScore(finalScore);
      setStreak((s) => s + 1);
      setLeft((l) => l + 3);
    } else {
      setStreak(0);
      setLeft((l) => Math.max(0, l - 5));
    }
    if (i === questions.length - 1 && finalScore >= questions.length - 1) {
      recordArenaWin();
      pushToast({ kind: "achievement", title: "Pattern sprint cleared", body: `${finalScore} of ${questions.length}` });
    }
    setTimeout(() => {
      setPicked(null);
      setI((x) => x + 1);
    }, right ? 650 : 1800);
  };

  const restart = () => {
    setSeed(Math.random());
    setI(0);
    setScore(0);
    setStreak(0);
    setLeft(90);
    setPicked(null);
  };

  if (over) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="panel grid place-items-center gap-3 p-8 text-center">
        <Ring value={score / questions.length} size={110} stroke={9} color={pct >= 80 ? "var(--easy)" : pct >= 50 ? "var(--medium)" : "var(--hard)"}>
          <div>
            <div className="text-xl font-extrabold">{pct}%</div>
            <div className="text-[9px] uppercase tracking-wider text-faint">accuracy</div>
          </div>
        </Ring>
        <div className="text-lg font-bold">
          {score} of {questions.length} correct
        </div>
        <p className="max-w-md text-sm text-dim">
          {pct >= 80
            ? "You are reading the signal fast. That is exactly the skill that saves you five minutes at the start of a real round."
            : "Pattern recognition is trainable. Open the pattern library and read the trigger phrases, then run this again."}
        </p>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={restart}>
            <Icon name="RotateCcw" size={13} /> Run it again
          </button>
          <Link href="/learn" className="btn">
            Pattern library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <Icon name="Timer" size={15} className={cx(left < 15 ? "text-hard" : "text-accent")} />
          <span className={cx("font-mono text-lg font-bold", left < 15 && "text-hard")}>{left}s</span>
        </div>
        <div className="min-w-0 flex-1">
          <Bar value={i / questions.length} height={5} />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono">
            {score} / {questions.length}
          </span>
          {streak >= 2 && (
            <Chip color="var(--streak)" icon="Flame">
              {streak} in a row
            </Chip>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="panel p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-faint">Which pattern fits</div>
          <h2 className="mt-2 text-lg font-bold leading-snug">{q?.prompt}</h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {options.map((opt) => {
              const isAnswer = opt === q.answer;
              const chosen = picked === opt;
              const show = picked !== null;
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={show}
                  className={cx(
                    "panel flex items-center gap-2.5 p-3 text-left transition-all",
                    !show && "hover:!border-accent hover:translate-x-0.5",
                  )}
                  style={
                    show
                      ? {
                          borderColor: isAnswer ? "var(--easy)" : chosen ? "var(--hard)" : "var(--border)",
                          background: isAnswer ? "rgba(47,212,143,.1)" : chosen ? "rgba(255,95,109,.1)" : undefined,
                        }
                      : undefined
                  }
                >
                  {show && (
                    <Icon
                      name={isAnswer ? "Check" : chosen ? "X" : "Circle"}
                      size={14}
                      style={{ color: isAnswer ? "var(--easy)" : chosen ? "var(--hard)" : "var(--text-faint)" }}
                    />
                  )}
                  <span className="text-sm font-medium">{PATTERN_MAP[opt]?.name ?? opt}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked && picked !== q.answer && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                <div className="rounded-xl border border-line-soft bg-panel-2/60 p-3 text-xs leading-relaxed text-dim">
                  <b className="text-text">{PATTERN_MAP[q.answer]?.name}</b> — {PATTERN_MAP[q.answer]?.idea}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Complexity drill
   ============================================================ */

function ComplexityDrill() {
  const recordQuiz = useStore((s) => s.recordQuiz);
  const [seed, setSeed] = useState(() => Math.random());
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const questions = useMemo(() => shuffle(COMPLEXITY_QUESTIONS, seed).slice(0, 10), [seed]);
  const q = questions[i];
  const over = i >= questions.length;

  const next = () => {
    if (i + 1 >= questions.length) recordQuiz(Math.round((score / questions.length) * 100));
    setI((x) => x + 1);
    setPicked(null);
  };

  const restart = () => {
    setSeed(Math.random());
    setI(0);
    setScore(0);
    setPicked(null);
  };

  if (over) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="panel grid place-items-center gap-3 p-8 text-center">
        <Ring value={score / questions.length} size={110} stroke={9} color={pct >= 80 ? "var(--easy)" : pct >= 50 ? "var(--medium)" : "var(--hard)"}>
          <div>
            <div className="text-xl font-extrabold">{pct}%</div>
            <div className="text-[9px] uppercase tracking-wider text-faint">score</div>
          </div>
        </Ring>
        <div className="text-lg font-bold">
          {score} of {questions.length} correct
        </div>
        <p className="max-w-md text-sm text-dim">
          Stating the complexity before you write code is half of what interviewers grade. Getting it wrong out loud is
          worse than a slower solution.
        </p>
        <button className="btn btn-primary" onClick={restart}>
          <Icon name="RotateCcw" size={13} /> Another set
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel flex items-center gap-4 p-4">
        <span className="font-mono text-xs text-faint">
          {i + 1} / {questions.length}
        </span>
        <div className="min-w-0 flex-1">
          <Bar value={i / questions.length} height={5} />
        </div>
        <span className="font-mono text-xs">{score} correct</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="panel overflow-hidden">
          <div className="hairline flex items-center gap-2 px-4 py-2.5">
            <Icon name="Code2" size={13} className="text-accent" />
            <span className="text-xs font-bold">What is the time complexity?</span>
            <Chip className="ml-auto !text-[9px]">{q.topic}</Chip>
          </div>
          <pre className="overflow-x-auto bg-panel-2/60 p-4 font-mono text-[12px] leading-relaxed">{q.code}</pre>

          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {q.options.map((opt, k) => {
              const show = picked !== null;
              const isAnswer = k === q.answer;
              const chosen = picked === k;
              return (
                <button
                  key={opt}
                  disabled={show}
                  onClick={() => {
                    setPicked(k);
                    if (k === q.answer) setScore((s) => s + 1);
                  }}
                  className={cx("panel p-3 text-left font-mono text-sm transition-all", !show && "hover:!border-accent")}
                  style={
                    show
                      ? {
                          borderColor: isAnswer ? "var(--easy)" : chosen ? "var(--hard)" : "var(--border)",
                          background: isAnswer ? "rgba(47,212,143,.1)" : chosen ? "rgba(255,95,109,.1)" : undefined,
                        }
                      : undefined
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden border-t border-line-soft">
                <div className="p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold" style={{ color: picked === q.answer ? "var(--easy)" : "var(--hard)" }}>
                    <Icon name={picked === q.answer ? "Check" : "X"} size={13} />
                    {picked === q.answer ? "Correct" : `The answer is ${q.options[q.answer]}`}
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-dim">{q.why}</p>
                  <button className="btn btn-primary mt-3 !py-1.5 !text-xs" onClick={next}>
                    Next <Icon name="ArrowRight" size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
