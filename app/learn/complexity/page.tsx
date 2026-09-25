"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Chip, SectionTitle, cx } from "@/components/ui/bits";

/**
 * Complexity as something you can move rather than memorise. Drag n and watch
 * which growth classes fall off the cliff; pick a constraint and see what is
 * still affordable.
 *
 * The budget assumption is stated on the page: roughly 10^8 simple operations
 * per second, which is the usual rule of thumb for judged environments.
 */

const OPS_PER_SEC = 1e8;

interface Growth {
  id: string;
  label: string;
  color: string;
  /** Operations at size n. May return Infinity, which the formatter handles. */
  f: (n: number) => number;
  examples: string;
  verdict: string;
}

const factorial = (n: number): number => {
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const GROWTHS: Growth[] = [
  { id: "1", label: "O(1)", color: "#2fd48f", f: () => 1, examples: "Hash lookup, array index, stack push", verdict: "Free. Size never matters." },
  { id: "logn", label: "O(log n)", color: "#34d3ff", f: (n) => Math.log2(Math.max(1, n)), examples: "Binary search, heap push, BST descent", verdict: "Effectively free. A billion items is 30 steps." },
  { id: "sqrt", label: "O(√n)", color: "#6ee7b7", f: (n) => Math.sqrt(n), examples: "Trial division primality, sqrt decomposition", verdict: "Comfortable well past a million." },
  { id: "n", label: "O(n)", color: "#6d5efc", f: (n) => n, examples: "One pass, two pointers, sliding window, BFS", verdict: "The target for almost every array question." },
  { id: "nlogn", label: "O(n log n)", color: "#b15cff", f: (n) => n * Math.log2(Math.max(2, n)), examples: "Sorting, heap of n, divide and conquer", verdict: "Fine to about 10^6. Usually the optimal bound." },
  { id: "n2", label: "O(n²)", color: "#ffb020", f: (n) => n * n, examples: "Nested loops, naive DP over pairs, bubble sort", verdict: "Dies around 10^4. Interviewers expect you to beat it." },
  { id: "n3", label: "O(n³)", color: "#ff9057", f: (n) => n ** 3, examples: "Floyd-Warshall, interval DP, matrix multiply", verdict: "Only viable to a few hundred." },
  { id: "2n", label: "O(2^n)", color: "#ff5f6d", f: (n) => 2 ** n, examples: "Subsets, bitmask DP, naive recursion", verdict: "Fine to n≈20, hopeless after n≈25." },
  { id: "nf", label: "O(n!)", color: "#f43f8e", f: factorial, examples: "Permutations, brute force TSP, N-Queens without pruning", verdict: "Fine to n≈10. Nothing beyond that." },
];

/** Constraint bands, with the largest complexity that usually passes. */
const CONSTRAINTS: { n: number; label: string; allow: string[]; note: string }[] = [
  { n: 10, label: "n ≤ 10", allow: ["1", "logn", "sqrt", "n", "nlogn", "n2", "n3", "2n", "nf"], note: "Permutations are on the table. The answer is probably backtracking." },
  { n: 20, label: "n ≤ 20", allow: ["1", "logn", "sqrt", "n", "nlogn", "n2", "n3", "2n"], note: "A dead giveaway for bitmask DP or subset enumeration." },
  { n: 100, label: "n ≤ 100", allow: ["1", "logn", "sqrt", "n", "nlogn", "n2", "n3"], note: "Cubic is fine. Interval DP and Floyd-Warshall live here." },
  { n: 1000, label: "n ≤ 1,000", allow: ["1", "logn", "sqrt", "n", "nlogn", "n2"], note: "Quadratic passes. Two nested loops over n are acceptable." },
  { n: 100000, label: "n ≤ 10^5", allow: ["1", "logn", "sqrt", "n", "nlogn"], note: "The most common band. You need n log n or better." },
  { n: 1000000, label: "n ≤ 10^6", allow: ["1", "logn", "sqrt", "n", "nlogn"], note: "Linear or n log n with a small constant. Avoid heavy allocation." },
  { n: 1000000000, label: "n ≤ 10^9", allow: ["1", "logn", "sqrt"], note: "You cannot even touch every element. Think maths, binary search on the answer, or O(log n)." },
];

function fmt(x: number): string {
  if (!Number.isFinite(x)) return "∞";
  if (x < 1000) return x < 10 ? x.toFixed(1).replace(/\.0$/, "") : Math.round(x).toString();
  if (x < 1e6) return `${Math.round(x).toLocaleString("en-US")}`;
  const exp = Math.floor(Math.log10(x));
  return `${(x / 10 ** exp).toFixed(1)}e${exp}`;
}

function duration(ops: number): { text: string; level: 0 | 1 | 2 | 3 } {
  if (!Number.isFinite(ops)) return { text: "never finishes", level: 3 };
  const s = ops / OPS_PER_SEC;
  if (s < 0.001) return { text: "< 1 ms", level: 0 };
  if (s < 1) return { text: `${(s * 1000).toFixed(0)} ms`, level: 0 };
  if (s < 60) return { text: `${s.toFixed(1)} s`, level: 1 };
  if (s < 3600) return { text: `${(s / 60).toFixed(0)} min`, level: 2 };
  if (s < 86400 * 365) return { text: `${(s / 86400).toFixed(0)} days`, level: 3 };
  const years = s / (86400 * 365);
  if (years > 1e9) return { text: `${fmt(years)} years`, level: 3 };
  return { text: `${fmt(years)} years`, level: 3 };
}

const LEVEL_COLOR = ["var(--easy)", "var(--medium)", "#ff9057", "var(--hard)"];
const LEVEL_LABEL = ["instant", "noticeable", "too slow", "impossible"];

/* Chart geometry. Log scale on both axes, since nothing else fits nine curves. */
const W = 640;
const H = 260;
const PAD = { l: 44, r: 12, t: 12, b: 26 };
const MAX_OPS_LOG = 18; // 10^18 is past any useful budget

const EXP_MIN = 0; // n = 1
const EXP_MAX = 9; // n = 10^9

export default function ComplexityPage() {
  const [exp, setExp] = useState(3); // n = 1000
  const [band, setBand] = useState<number | null>(null);
  const n = Math.round(10 ** exp);

  const rows = useMemo(
    () =>
      GROWTHS.map((g) => {
        const ops = g.f(n);
        return { g, ops, ...duration(ops) };
      }).sort((a, b) => a.ops - b.ops),
    [n],
  );

  const allowed = band !== null ? new Set(CONSTRAINTS[band].allow) : null;

  const x = (e: number) => PAD.l + ((e - EXP_MIN) / (EXP_MAX - EXP_MIN)) * (W - PAD.l - PAD.r);
  const y = (ops: number) => {
    const l = Number.isFinite(ops) ? Math.min(MAX_OPS_LOG, Math.log10(Math.max(1, ops))) : MAX_OPS_LOG;
    return H - PAD.b - (l / MAX_OPS_LOG) * (H - PAD.t - PAD.b);
  };

  const paths = useMemo(
    () =>
      GROWTHS.map((g) => {
        const pts: string[] = [];
        for (let e = EXP_MIN; e <= EXP_MAX; e += 0.15) {
          const nn = 10 ** e;
          const ops = g.f(nn);
          if (!Number.isFinite(ops) && pts.length) break;
          pts.push(`${x(e).toFixed(1)},${y(ops).toFixed(1)}`);
          if (!Number.isFinite(ops)) break;
        }
        return { g, d: `M ${pts.join(" L ")}` };
      }),
    [],
  );

  const budgetY = y(OPS_PER_SEC);

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <SectionTitle
        icon="Gauge"
        title="Complexity explorer"
        sub="Drag the input size and watch which growth classes survive. This is the fastest way to build the instinct interviewers test."
        right={
          <Link href="/learn" className="btn !py-1.5 !text-xs">
            <Icon name="ArrowLeft" size={12} /> Learn
          </Link>
        }
      />

      {/* the slider */}
      <div className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Input size</span>
            <div className="flex items-baseline gap-2">
              <motion.span key={n} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-2xl font-extrabold">
                n = {n.toLocaleString("en-US")}
              </motion.span>
              <span className="font-mono text-xs text-faint">10^{exp.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 5, 6, 9].map((e) => (
              <button key={e} onClick={() => setExp(e)} className={cx("chip cursor-pointer", Math.abs(exp - e) < 0.05 && "border-accent text-accent")}>
                10^{e}
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={EXP_MIN}
          max={EXP_MAX}
          step={0.1}
          value={exp}
          onChange={(e) => setExp(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
          aria-label="Input size exponent"
        />
        <p className="text-[11px] text-faint">
          Budget assumed at 10^8 simple operations per second, the usual rule of thumb for a one second limit. Real
          constants, cache behaviour and language overhead all move this, so treat it as an order of magnitude.
        </p>
      </div>

      {/* curves */}
      <div className="panel overflow-hidden">
        <div className="hairline flex flex-wrap items-center gap-2 px-4 py-2.5">
          <Icon name="TrendingUp" size={14} className="text-accent" />
          <span className="text-xs font-bold">Growth curves</span>
          <span className="text-[10px] text-faint">both axes logarithmic</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-faint">
            <span className="h-0 w-4 border-t border-dashed" style={{ borderColor: "var(--hard)" }} /> one second budget
          </span>
        </div>
        <div className="overflow-x-auto p-3">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 560, width: "100%", height: "auto" }} role="img" aria-label="Growth rate curves">
            {/* horizontal gridlines every 3 decades of operations */}
            {[0, 3, 6, 9, 12, 15, 18].map((l) => (
              <g key={l}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(10 ** l)} y2={y(10 ** l)} stroke="var(--line-soft)" strokeWidth={1} />
                <text x={PAD.l - 6} y={y(10 ** l) + 3} fontSize={8.5} textAnchor="end" fill="var(--faint)">
                  10^{l}
                </text>
              </g>
            ))}
            {/* x ticks */}
            {[0, 2, 4, 6, 8, 9].map((e) => (
              <text key={e} x={x(e)} y={H - 8} fontSize={8.5} textAnchor="middle" fill="var(--faint)">
                10^{e}
              </text>
            ))}

            {/* the one second budget line */}
            <line x1={PAD.l} x2={W - PAD.r} y1={budgetY} y2={budgetY} stroke="var(--hard)" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.8} />

            {paths.map(({ g, d }) => {
              const lit = !allowed || allowed.has(g.id);
              return (
                <motion.path
                  key={g.id}
                  d={d}
                  fill="none"
                  stroke={g.color}
                  strokeWidth={lit ? 2 : 1}
                  strokeOpacity={lit ? 0.95 : 0.18}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              );
            })}

            {/* the marker for the current n */}
            <motion.line
              x1={x(exp)}
              x2={x(exp)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--text)"
              strokeWidth={1}
              opacity={0.45}
              animate={{ x1: x(exp), x2: x(exp) }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {GROWTHS.map((g) => {
              const ops = g.f(n);
              const lit = !allowed || allowed.has(g.id);
              if (!Number.isFinite(ops) && ops !== Infinity) return null;
              return (
                <motion.circle
                  key={g.id}
                  r={lit ? 3.4 : 2}
                  fill={g.color}
                  opacity={lit ? 1 : 0.2}
                  animate={{ cx: x(exp), cy: y(ops) }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* constraint decoder */}
      <div>
        <SectionTitle
          icon="Crosshair"
          title="Constraint decoder"
          sub="The constraints in a problem statement usually name the algorithm. Pick a band to see what still fits."
        />
        <div className="mb-3 flex flex-wrap gap-1.5">
          {CONSTRAINTS.map((c, i) => (
            <button
              key={c.label}
              onClick={() => {
                setBand(band === i ? null : i);
                setExp(Math.log10(c.n));
              }}
              className={cx("chip cursor-pointer font-mono transition-colors", band === i ? "border-accent text-accent" : "hover:border-accent/60")}
            >
              {c.label}
            </button>
          ))}
          {band !== null && (
            <button onClick={() => setBand(null)} className="chip cursor-pointer text-faint">
              clear
            </button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {band !== null && (
            <motion.div
              key={band}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="panel mb-3 flex items-start gap-2.5 p-3.5"
              style={{ background: "var(--accent-soft)" }}
            >
              <Icon name="Lightbulb" size={15} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">{CONSTRAINTS[band].label}</span> — {CONSTRAINTS[band].note}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the table */}
      <div className="panel overflow-hidden">
        <div className="hairline grid grid-cols-[92px_1fr_88px_96px] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-faint sm:grid-cols-[100px_1fr_110px_110px]">
          <span>Class</span>
          <span>Where you meet it</span>
          <span className="text-right">Operations</span>
          <span className="text-right">At 10^8/s</span>
        </div>
        {rows.map(({ g, ops, text, level }) => {
          const lit = !allowed || allowed.has(g.id);
          return (
            <motion.div
              key={g.id}
              layout
              animate={{ opacity: lit ? 1 : 0.35 }}
              className="grid grid-cols-[92px_1fr_88px_96px] items-center gap-2 border-b border-line-soft px-4 py-2.5 last:border-0 sm:grid-cols-[100px_1fr_110px_110px]"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.color }} />
                <span className="font-mono text-xs font-bold">{g.label}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs">{g.examples}</span>
                <span className="block truncate text-[10px] text-faint">{g.verdict}</span>
              </span>
              <span className="text-right font-mono text-xs tabular-nums">{fmt(ops)}</span>
              <span className="flex items-center justify-end gap-1.5">
                <span className="font-mono text-[11px]" style={{ color: LEVEL_COLOR[level] }}>
                  {text}
                </span>
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {LEVEL_LABEL.map((l, i) => (
          <div key={l} className="panel flex items-center gap-2 p-3">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_COLOR[i] }} />
            <span className="text-xs font-semibold">{l}</span>
            <span className="ml-auto font-mono text-[10px] text-faint">
              {i === 0 ? "< 1 s" : i === 1 ? "1–60 s" : i === 2 ? "minutes" : "forget it"}
            </span>
          </div>
        ))}
      </div>

      <div className="panel space-y-2 p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon name="Info" size={15} className="text-accent-3" /> How to use this in a live interview
        </div>
        {[
          "Read the constraints before the examples. They rule out whole families of solution.",
          "State the complexity of your brute force out loud, then say which band it fails in. That is how you justify optimising.",
          "If n is tiny, say so, and stop apologising for exponential. Backtracking is the intended answer at n ≤ 20.",
          "If n is 10^9, the answer never touches every element. Look for maths, two pointers on a formula, or binary search on the answer.",
        ].map((t) => (
          <div key={t} className="flex items-start gap-2 text-xs leading-relaxed text-dim">
            <Icon name="Check" size={12} className="mt-0.5 shrink-0 text-easy" />
            {t}
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Chip color="var(--accent)">
            <Link href="/visualize/compare">Race two algorithms →</Link>
          </Chip>
          <Chip color="var(--accent-2)">
            <Link href="/arena">Complexity drill in the arena →</Link>
          </Chip>
        </div>
      </div>
    </div>
  );
}
