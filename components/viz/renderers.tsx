"use client";

import { AnimatePresence, motion } from "motion/react";
import type { VizFrame, VizKind } from "@/lib/types";
import { cx } from "@/components/ui/bits";

const C = {
  idle: "#2b3550",
  compare: "#ffb020",
  swap: "#ff5f6d",
  done: "#2fd48f",
  active: "#6d5efc",
  window: "#34d3ff",
  ghost: "#1a2236",
  pivot: "#b15cff",
  best: "#ffcc4d",
};

const num = (v: unknown, d = 0) => (typeof v === "number" ? v : d);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const rec = <T,>(v: unknown): Record<string, T> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, T>) : {};

/* ============================================================
   Array / bars
   ============================================================ */

function AuxRow({
  label,
  values,
  highlight,
  color = C.window,
  mono = true,
}: {
  label: string;
  values: (number | string)[];
  highlight?: number[];
  color?: string;
  mono?: boolean;
}) {
  if (!values.length) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="w-[68px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-faint">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {values.map((v, i) => (
          <motion.div
            key={`${label}-${i}`}
            layout
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cx(
              "grid h-7 min-w-7 place-items-center rounded-md border px-1.5 text-[11px]",
              mono && "font-mono",
            )}
            style={{
              borderColor: highlight?.includes(i) ? color : "var(--border)",
              background: highlight?.includes(i) ? `${color}26` : "var(--panel-2)",
              color: highlight?.includes(i) ? color : "var(--text-dim)",
            }}
          >
            {v}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ArrayView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const a = arr<number>(s.arr);
  const compare = arr<number>(s.compare);
  const swap = arr<number>(s.swap);
  const sorted = arr<number>(s.sorted);
  const fixed = arr<number>(s.fixed);
  const pointers = arr<{ name: string; index: number; color: string }>(s.pointers);
  const range = arr<number>(s.range);
  const window = arr<number>(s.window);
  const bestRange = arr<number>(s.bestRange);
  const discarded = arr<number>(s.discarded);
  const pivot = s.pivot as number | undefined;
  const home = arr<boolean>(s.home);
  const max = Math.max(1, ...a.map((v) => Math.abs(v)));
  const hasNeg = a.some((v) => v < 0);

  const colorFor = (i: number) => {
    if (swap.includes(i)) return C.swap;
    if (compare.includes(i)) return C.compare;
    if (sorted.includes(i) || fixed.includes(i)) return C.done;
    if (pivot === i) return C.pivot;
    if (home.length && home[i]) return C.done;
    if (window.length === 2 && i >= window[0] && i <= window[1]) return C.window;
    if (range.length === 2 && (i < range[0] || i > range[1])) return C.ghost;
    if (discarded.length === 2 && i >= discarded[0] && i <= discarded[1]) return C.ghost;
    return C.idle;
  };

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-2">
      {/* pointer rail */}
      <div className="relative h-5">
        {pointers.map((p) => (
          <motion.div
            key={p.name}
            className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-bold"
            style={{ left: `${((p.index + 0.5) / Math.max(1, a.length)) * 100}%`, color: p.color }}
            layout
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {p.name}
            <span className="block text-center leading-none">▾</span>
          </motion.div>
        ))}
      </div>

      {/* bars */}
      <div className="flex items-end justify-center gap-[3px]" style={{ height: 180 }}>
        {a.map((v, i) => {
          const color = colorFor(i);
          const h = (Math.abs(v) / max) * (hasNeg ? 76 : 100);
          const isBest = bestRange.length === 2 && i >= bestRange[0] && i <= bestRange[1];
          return (
            <motion.div
              key={i}
              layout
              className="relative flex min-w-0 flex-1 flex-col justify-end"
              style={{ maxWidth: 52, height: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            >
              {isBest && (
                <motion.span
                  layoutId={`best-${i}`}
                  className="absolute inset-x-0 -top-1 h-1 rounded-full"
                  style={{ background: C.best }}
                />
              )}
              <motion.div
                className="flex items-start justify-center rounded-t-md pt-1 text-[10px] font-bold"
                style={{
                  height: `${Math.max(9, h)}%`,
                  background: `linear-gradient(180deg, ${color}, ${color}88)`,
                  boxShadow: color !== C.idle && color !== C.ghost ? `0 0 16px -4px ${color}` : undefined,
                  color: "#0b0f1a",
                }}
                animate={{ height: `${Math.max(9, h)}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                {a.length <= 18 && <span className="drop-shadow">{v}</span>}
              </motion.div>
              <div className="mt-0.5 text-center font-mono text-[9px] text-faint">{a.length <= 24 ? i : ""}</div>
            </motion.div>
          );
        })}
      </div>

      {/* auxiliary structures */}
      <div className="space-y-1.5">
        <AuxRow label={String(s.shadowLabel ?? "aux")} values={arr<number>(s.shadow)} highlight={arr<number>(s.shadowHighlight)} />
        <AuxRow label="tails" values={arr<number>(s.tails)} highlight={[num(s.appended, -1), num(s.replaced, -1)].filter((x) => x >= 0)} color={C.active} />
        <AuxRow label="deque" values={arr<number>(s.deque)} color={C.active} />
        <AuxRow label="stack" values={arr<number>(s.stack)} color={C.pivot} />
        <AuxRow label="prefix" values={arr<number>(s.prefixes)} color={C.window} />
        <AuxRow label="answer" values={arr<number>(s.ans).map((v) => (v === -1 ? "-" : v))} color={C.done} />
        <AuxRow label="output" values={arr<number>(s.out)} color={C.done} />
        <AuxRow label="hours" values={arr<number>(s.perPile)} color={C.compare} />
        {arr<[number, number]>(s.map).length > 0 && (
          <AuxRow
            label="seen map"
            values={arr<[number, number]>(s.map).map(([k, v]) => `${k}:${v}`)}
            highlight={arr<[number, number]>(s.map).reduce<number[]>((acc, [k], i) => (k === num(s.need, NaN) ? [...acc, i] : acc), [])}
            color={C.window}
          />
        )}
      </div>

      {/* scalar readouts */}
      <div className="flex flex-wrap gap-2">
        {"sum" in s && <Pill label="sum" value={String(s.sum)} color={C.window} />}
        {"cur" in s && <Pill label="current" value={String(s.cur)} color={C.active} />}
        {"best" in s && typeof s.best === "number" && <Pill label="best" value={String(s.best)} color={C.best} />}
        {"target" in s && <Pill label="target" value={String(s.target)} color={C.compare} />}
        {"limit" in s && <Pill label="limit" value={String(s.limit)} color={C.compare} />}
        {"candidate" in s && s.candidate !== null && <Pill label="speed" value={String(s.candidate)} color={C.pivot} />}
        {"need" in s && typeof s.need === "number" && <Pill label="hours needed" value={String(s.need)} color={C.window} />}
        {"H" in s && <Pill label="hours allowed" value={String(s.H)} color={C.done} />}
        {"ans" in s && typeof s.ans === "number" && <Pill label="count" value={String(s.ans)} color={C.done} />}
        {"answer" in s && typeof s.answer === "number" && <Pill label="answer" value={String(s.answer)} color={C.done} />}
      </div>

      {arr<string>(s.results).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {arr<string>(s.results).map((r, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="chip !text-[10px]"
              style={{ borderColor: `${C.done}55`, color: C.done }}
            >
              {r}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]"
      style={{ borderColor: `${color}44`, background: `${color}12` }}
    >
      <span className="text-faint">{label}</span>
      <span className="font-mono font-bold" style={{ color }}>
        {value}
      </span>
    </span>
  );
}

/* ============================================================
   Grid
   ============================================================ */

export function GridView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const grid = arr<(number | string)[]>(s.grid);
  const colors = rec<string>(s.colors);
  const cursor = arr<number>(s.cursor);
  const labelled = Boolean(s.labelled);
  const queens = arr<number>(s.queens);
  const cols = grid[0]?.length ?? 1;
  const cell = Math.max(20, Math.min(46, Math.floor(360 / Math.max(cols, grid.length))));

  return (
    <div className="grid h-full place-items-center p-2">
      <div className="inline-block rounded-xl border border-line p-1.5" style={{ background: "var(--panel-2)" }}>
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((v, c) => {
              const isCursor = cursor.length === 2 && cursor[0] === r && cursor[1] === c;
              const bg = colors[`${r},${c}`];
              const isQueen = queens[r] === c;
              const water = v === 0 || v === "0";
              const land = v === 1 || v === "1";
              const visited = v === 2;
              return (
                <motion.div
                  key={c}
                  layout
                  className={cx(
                    "m-[1.5px] grid place-items-center rounded-[5px] border text-[11px] font-bold transition-colors",
                    isCursor && "ring-2 ring-offset-0",
                  )}
                  style={{
                    width: cell,
                    height: cell,
                    background: bg ?? (visited ? "#6d5efc33" : land ? "#2fd48f2a" : water ? "#0e1320" : "var(--panel)"),
                    borderColor: isCursor ? C.compare : bg ? `${bg}` : "var(--border-soft)",
                    color: bg && bg.length === 7 ? "#05070d" : "var(--text-dim)",
                    boxShadow: isCursor ? `0 0 14px -2px ${C.compare}` : undefined,
                  }}
                  animate={isCursor ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.28 }}
                >
                  {isQueen ? (
                    <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} className="text-base">
                      ♛
                    </motion.span>
                  ) : labelled ? (
                    <span>{v}</span>
                  ) : typeof v === "number" && v > 2 ? (
                    <span>{v}</span>
                  ) : typeof v === "string" && v !== "." && v !== "," && v !== "0" ? (
                    <span>{v}</span>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Graph
   ============================================================ */

export function GraphView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const nodes = arr<{ id: number; label: string; x: number; y: number }>(s.nodes);
  const edges = arr<{ u: number; v: number; w: number; directed?: boolean }>(s.edges);
  const nodeColor = rec<string>(s.nodeColor);
  const edgeColor = rec<string>(s.edgeColor);
  const dist = rec<number | string>(s.dist);
  const indeg = arr<number>(s.indeg);
  const comp = rec<number>(s.comp);
  const current = s.current as number | undefined;
  const activeEdge = s.activeEdge as string | undefined;
  const weighted = edges.some((e) => e.w !== 1);

  const pos = (id: number) => nodes.find((n) => n.id === id) ?? { x: 50, y: 50 };

  return (
    <div className="flex h-full flex-col gap-2 p-1">
      <div className="relative flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-faint)" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = pos(e.u), b = pos(e.v);
            const k = e.directed ? `${e.u}-${e.v}` : `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
            const col = edgeColor[k];
            const isActive = activeEdge === k;
            return (
              <g key={i}>
                <motion.line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={col ?? (isActive ? C.compare : "var(--border)")}
                  strokeWidth={col || isActive ? 0.9 : 0.5}
                  markerEnd={e.directed ? "url(#arrow)" : undefined}
                  animate={{ opacity: col || isActive ? 1 : 0.55 }}
                />
                {weighted && (
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 1}
                    textAnchor="middle"
                    fontSize="2.6"
                    fill={col ?? "var(--text-faint)"}
                    style={{ paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 0.8 }}
                  >
                    {e.w}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map((n) => {
            const col = nodeColor[n.id] ?? "var(--panel-2)";
            const isCur = current === n.id;
            const d = dist[n.id];
            return (
              <g key={n.id}>
                {isCur && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={7}
                    fill="none"
                    stroke={C.compare}
                    strokeWidth={0.5}
                    initial={{ r: 5, opacity: 0.9 }}
                    animate={{ r: 9, opacity: 0 }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                )}
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={4.6}
                  fill={col}
                  stroke={isCur ? C.compare : "var(--border)"}
                  strokeWidth={isCur ? 0.7 : 0.35}
                  animate={{ scale: isCur ? 1.12 : 1 }}
                  style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
                />
                <text x={n.x} y={n.y + 1.3} textAnchor="middle" fontSize="3.4" fontWeight="700" fill="#fff">
                  {n.label}
                </text>
                {d !== undefined && (
                  <text x={n.x} y={n.y - 6.2} textAnchor="middle" fontSize="2.8" fill={C.window} fontWeight="700">
                    {d}
                  </text>
                )}
                {indeg.length > 0 && (
                  <text x={n.x + 5.6} y={n.y + 5.6} textAnchor="middle" fontSize="2.6" fill={C.compare}>
                    {indeg[n.id]}
                  </text>
                )}
                {Object.keys(comp).length > 0 && (
                  <text x={n.x} y={n.y + 8} textAnchor="middle" fontSize="2.4" fill="var(--text-faint)">
                    set {comp[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="space-y-1.5">
        <AuxRow label="queue" values={arr<number>(s.queue)} color={C.window} />
        <AuxRow label="stack" values={arr<number>(s.stack)} color={C.pivot} />
        <AuxRow label="order" values={arr<number>(s.order)} color={C.done} />
        <AuxRow label="pq" values={arr<[number, number]>(s.pq).map(([d, n]) => `${n}@${d}`)} color={C.active} />
        <AuxRow label="edges" values={arr<string>(s.sortedEdges)} color={C.compare} />
        {"cost" in s && (
          <div className="flex gap-2">
            <Pill label="total cost" value={String(s.cost)} color={C.done} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Tree
   ============================================================ */

export function TreeView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const nodes = arr<{ id: number; val: number | string; x: number; y: number; left?: number | null; right?: number | null; parent?: number | null; isWord?: boolean }>(
    s.nodes ?? s.trie,
  );
  const color = rec<string>(s.color);
  const bounds = rec<string>(s.bounds);
  const current = s.current as number | undefined;
  const byId = (id: number) => nodes.find((n) => n.id === id);

  const links: { a: { x: number; y: number }; b: { x: number; y: number }; key: string }[] = [];
  for (const n of nodes) {
    for (const child of [n.left, n.right]) {
      if (child !== null && child !== undefined) {
        const c = byId(child);
        if (c) links.push({ a: n, b: c, key: `${n.id}-${child}` });
      }
    }
    if (n.parent !== null && n.parent !== undefined) {
      const p = byId(n.parent);
      if (p) links.push({ a: p, b: n, key: `${n.parent}-${n.id}` });
    }
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative min-h-0 flex-1">
        {nodes.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-faint">Empty</div>
        ) : (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {links.map((l) => (
              <line key={l.key} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke="var(--border)" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        )}
        {nodes.map((n) => {
          const col = color[n.id];
          const isCur = current === n.id;
          return (
            <motion.div
              key={n.id}
              layout
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <motion.div
                className={cx(
                  "grid h-9 w-9 place-items-center rounded-full border text-[12px] font-bold",
                  n.isWord && "ring-2 ring-easy/70",
                )}
                style={{
                  background: col ?? "var(--panel-2)",
                  borderColor: col ?? "var(--border)",
                  color: col ? "#05070d" : "var(--text)",
                  boxShadow: col ? `0 0 16px -3px ${col}` : undefined,
                }}
                animate={isCur ? { scale: [1, 1.16, 1] } : { scale: 1 }}
                transition={{ duration: 0.34 }}
              >
                {n.val}
              </motion.div>
              {bounds[n.id] && (
                <div className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-faint">
                  {bounds[n.id]}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <AuxRow label="array" values={arr<number>(s.array)} color={C.active} />
        <AuxRow label="pre" values={arr<number>(s.pre)} color={C.active} />
        <AuxRow label="in" values={arr<number>(s.ino)} color={C.window} />
        <AuxRow label="post" values={arr<number>(s.post)} color={C.done} />
        <AuxRow label="queue" values={arr<number>(s.queue).map((id) => byId(id)?.val ?? id)} color={C.window} />
        <AuxRow label="stack" values={arr<number>(s.stack).map((id) => byId(id)?.val ?? id)} color={C.pivot} />
        <AuxRow label="popped" values={arr<number>(s.popped)} color={C.done} />
        {arr<number[]>(s.levels).length > 0 && (
          <div className="flex items-start gap-2">
            <span className="w-[68px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-faint">levels</span>
            <div className="flex flex-col gap-1">
              {arr<number[]>(s.levels).map((lv, i) => (
                <div key={i} className="flex gap-1">
                  {lv.map((v, j) => (
                    <span key={j} className="grid h-6 min-w-6 place-items-center rounded border border-line bg-panel-2 px-1 font-mono text-[10px]">
                      {v}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Linked list
   ============================================================ */

export function ListView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const nodes = arr<{ id: number; val: number; lane?: number }>(s.nodes);
  const next = rec<number | null>(s.next);
  const pointers = arr<{ name: string; id: number; color: string }>(s.pointers);
  const out = arr<number>(s.out);
  const lanes = num(s.lanes, 1);
  const byId = (id: number) => nodes.find((n) => n.id === id);

  const NodeBox = ({ n, extra }: { n: { id: number; val: number }; extra?: string }) => {
    const ptrs = pointers.filter((p) => p.id === n.id);
    const flipped = s.flipped === n.id;
    const meeting = s.meeting === n.id || s.entry === n.id;
    return (
      <div className="relative flex flex-col items-center">
        <div className="mb-1 flex h-4 gap-1">
          {ptrs.map((p) => (
            <motion.span
              key={p.name}
              layoutId={`ptr-${p.name}`}
              className="rounded px-1 text-[9px] font-bold leading-4"
              style={{ background: `${p.color}22`, color: p.color }}
            >
              {p.name}
            </motion.span>
          ))}
        </div>
        <motion.div
          layout
          className="grid h-11 w-11 place-items-center rounded-xl border-2 font-mono text-sm font-bold"
          style={{
            borderColor: meeting ? C.swap : flipped ? C.done : ptrs[0]?.color ?? "var(--border)",
            background: meeting ? `${C.swap}22` : "var(--panel-2)",
            boxShadow: ptrs.length ? `0 0 16px -4px ${ptrs[0].color}` : undefined,
          }}
          animate={flipped ? { scale: [1, 1.14, 1] } : {}}
        >
          {n.val}
        </motion.div>
        {extra && <div className="mt-0.5 text-[9px] text-faint">{extra}</div>}
      </div>
    );
  };

  if (lanes === 2) {
    const laneA = nodes.filter((n) => n.lane === 0);
    const laneB = nodes.filter((n) => n.lane === 1);
    const taken = s.taken as number | undefined;
    return (
      <div className="flex h-full flex-col justify-center gap-6 p-3">
        {[laneA, laneB].map((lane, li) => (
          <div key={li} className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 text-[10px] font-bold uppercase tracking-wider text-faint">list {li === 0 ? "A" : "B"}</span>
            {lane.map((n) => (
              <div key={n.id} className="flex items-center gap-1.5" style={{ opacity: out.includes(n.id) ? 0.3 : 1 }}>
                <NodeBox n={n} />
                <span className="text-faint">→</span>
              </div>
            ))}
            <span className="text-[10px] text-faint">null</span>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-4">
          <span className="w-14 text-[10px] font-bold uppercase tracking-wider text-easy">merged</span>
          <AnimatePresence>
            {out.map((id) => (
              <motion.div
                key={id}
                initial={{ scale: 0.6, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="flex items-center gap-1.5"
              >
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg border font-mono text-xs font-bold"
                  style={{ borderColor: taken === id ? C.done : `${C.done}55`, background: `${C.done}18`, color: C.done }}
                >
                  {byId(id)?.val}
                </div>
                <span className="text-faint">→</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // single list: walk from head following next
  const order: number[] = [];
  let cur = s.head as number | null | undefined;
  const seen = new Set<number>();
  while (cur !== null && cur !== undefined && !seen.has(cur)) {
    seen.add(cur);
    order.push(cur);
    cur = next[cur] ?? null;
  }
  const orphans = nodes.filter((n) => !seen.has(n.id));

  return (
    <div className="flex h-full flex-col justify-center gap-6 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {order.map((id, i) => (
          <div key={id} className="flex items-center gap-1.5">
            <NodeBox n={byId(id)!} />
            <motion.span layout className="text-faint">
              {i === order.length - 1 && next[id] === null ? "→ null" : "→"}
            </motion.span>
          </div>
        ))}
        {cur !== null && cur !== undefined && seen.has(cur) && (
          <span className="rounded-lg border border-hard/50 px-2 py-1 text-[10px] font-bold text-hard">
            loops back to {byId(cur)?.val}
          </span>
        )}
      </div>
      {orphans.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 opacity-45">
          <span className="w-16 text-[10px] font-bold uppercase tracking-wider text-faint">detached</span>
          {orphans.map((n) => (
            <NodeBox key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DP table
   ============================================================ */

export function DpTableView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const table = arr<(number | string)[]>(s.table);
  const rowLabels = arr<string>(s.rowLabels);
  const colLabels = arr<string>(s.colLabels);
  const cursor = arr<number>(s.cursor);
  const deps = arr<number[]>(s.deps);
  const path = arr<number[]>(s.path);
  const source = arr<number[]>(s.source);
  const cols = table[0]?.length ?? 1;
  const w = Math.max(26, Math.min(48, Math.floor(420 / cols)));

  const isDep = (r: number, c: number) => deps.some((d) => d[0] === r && d[1] === c);
  const inPath = (r: number, c: number) => path.some((d) => d[0] === r && d[1] === c);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 overflow-auto p-2">
      <div className="inline-block">
        <div className="flex">
          <div style={{ width: 92 }} />
          {colLabels.map((cl, c) => (
            <div key={c} className="text-center font-mono text-[10px] text-faint" style={{ width: w }}>
              {cl}
            </div>
          ))}
        </div>
        {table.map((row, r) => (
          <div key={r} className="flex items-center">
            <div className="truncate pr-2 text-right text-[10px] text-faint" style={{ width: 92 }}>
              {rowLabels[r] ?? r}
            </div>
            {row.map((v, c) => {
              const isCur = cursor.length === 2 && cursor[0] === r && cursor[1] === c;
              const dep = isDep(r, c);
              const pathCell = inPath(r, c);
              return (
                <motion.div
                  key={c}
                  className="m-[1.5px] grid place-items-center rounded-md border font-mono text-[11px] font-semibold"
                  style={{
                    width: w - 3,
                    height: 30,
                    background: isCur ? `${C.compare}2c` : pathCell ? `${C.done}22` : dep ? `${C.window}1c` : "var(--panel-2)",
                    borderColor: isCur ? C.compare : pathCell ? `${C.done}77` : dep ? `${C.window}66` : "var(--border-soft)",
                    color: isCur ? C.compare : pathCell ? C.done : v === 0 ? "var(--text-faint)" : "var(--text)",
                  }}
                  animate={isCur ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                  transition={{ duration: 0.26 }}
                >
                  {source.length > 0 && (
                    <span className="absolute -mt-4 ml-0 text-[8px] text-faint">{source[r]?.[c]}</span>
                  )}
                  {v}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {"match" in s && s.match === true && <Pill label="characters" value="match" color={C.done} />}
        {"op" in s && <Pill label="cheapest" value={String(s.op)} color={C.compare} />}
        {"coin" in s && <Pill label="coin" value={String(s.coin)} color={C.pivot} />}
        {"answer" in s && <Pill label="answer" value={String(s.answer)} color={C.done} />}
        {arr<number>(s.chosen).length > 0 && <Pill label="items taken" value={arr<number>(s.chosen).join(", ")} color={C.done} />}
        {arr<number>(s.used).length > 0 && <Pill label="coins used" value={arr<number>(s.used).join(" + ")} color={C.done} />}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-faint">
        <LegendDot color={C.compare} label="cell being filled" />
        <LegendDot color={C.window} label="cells it reads" />
        <LegendDot color={C.done} label="reconstructed answer" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ============================================================
   Recursion tree
   ============================================================ */

export function RecursionView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const nodes = arr<{ id: number; label: string; parent: number | null; depth: number; state: string }>(s.nodes);
  const current = s.current as number | undefined;
  const maxDepth = Math.max(1, ...nodes.map((n) => n.depth));

  // simple layered layout
  const byDepth: Record<number, typeof nodes> = {};
  for (const n of nodes) (byDepth[n.depth] ??= []).push(n);
  const posOf = (n: (typeof nodes)[number]) => {
    const row = byDepth[n.depth];
    const idx = row.indexOf(n);
    return { x: ((idx + 0.5) / row.length) * 100, y: 8 + (n.depth / (maxDepth + 0.4)) * 88 };
  };
  const colorOf = (state: string) =>
    state === "memo" ? C.done : state === "base" ? C.window : state === "done" ? C.active : C.compare;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          {nodes.map((n) => {
            if (n.parent === null) return null;
            const p = nodes.find((x) => x.id === n.parent);
            if (!p) return null;
            const a = posOf(p), b = posOf(n);
            return <line key={n.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        {nodes.map((n) => {
          const p = posOf(n);
          const col = colorOf(n.state);
          return (
            <motion.div
              key={n.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: current === n.id ? 1.1 : 1, opacity: n.state === "memo" ? 1 : 0.96 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border px-1.5 py-0.5 font-mono text-[9px] font-bold"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                borderColor: col,
                background: `${col}22`,
                color: col,
                boxShadow: current === n.id ? `0 0 14px -3px ${col}` : undefined,
              }}
            >
              {n.label}
            </motion.div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {"mode" in s && (
          <Pill label="mode" value={s.mode === "memo" ? "memoised" : "brute force"} color={s.mode === "memo" ? C.done : C.swap} />
        )}
        {arr<[number, number]>(s.memo).length > 0 && (
          <Pill label="cache" value={arr<[number, number]>(s.memo).map(([k, v]) => `${k}:${v}`).join("  ")} color={C.done} />
        )}
        {arr<number>(s.path).length > 0 && <Pill label="path" value={`[${arr<number>(s.path).join(",")}]`} color={C.active} />}
      </div>
      {arr<string>(s.results).length > 0 && (
        <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto">
          {arr<string>(s.results).map((r, i) => (
            <motion.span key={i} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="chip !text-[10px]" style={{ borderColor: `${C.done}55`, color: C.done }}>
              {r}
            </motion.span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-[10px] text-faint">
        <LegendDot color={C.compare} label="in progress" />
        <LegendDot color={C.window} label="base case" />
        <LegendDot color={C.active} label="returned" />
        <LegendDot color={C.done} label="cache hit" />
      </div>
    </div>
  );
}

/* ============================================================
   Text / string matching
   ============================================================ */

export function TextView({ frame }: { frame: VizFrame }) {
  const s = frame.state;
  const text = String(s.text ?? "");
  const pat = String(s.pat ?? "");
  const lps = arr<number>(s.lps);
  const i = num(s.i, -1);
  const j = num(s.j, -1);
  const matches = arr<number>(s.matches);
  const phase = String(s.phase ?? "search");
  const offset = phase === "search" ? i - j : -1;

  const Cell = ({ ch, color, label, bg }: { ch: string; color?: string; label?: string; bg?: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="grid h-8 w-8 place-items-center rounded-md border font-mono text-sm font-bold"
        style={{ borderColor: color ?? "var(--border)", background: bg ?? "var(--panel-2)", color: color ?? "var(--text)" }}
      >
        {ch}
      </div>
      <span className="mt-0.5 font-mono text-[9px] text-faint">{label}</span>
    </div>
  );

  return (
    <div className="flex h-full flex-col justify-center gap-5 p-3">
      <div>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">text</div>
        <div className="flex flex-wrap gap-1">
          {text.split("").map((ch, idx) => {
            const inMatch = matches.some((m) => idx >= m && idx < m + pat.length);
            const isCursor = phase === "search" && idx === i;
            const inWindow = phase === "search" && offset >= 0 && idx >= offset && idx < offset + pat.length;
            return (
              <Cell
                key={idx}
                ch={ch}
                label={String(idx)}
                color={isCursor ? C.compare : inMatch ? C.done : inWindow ? C.active : undefined}
                bg={isCursor ? `${C.compare}28` : inMatch ? `${C.done}22` : inWindow ? `${C.active}18` : undefined}
              />
            );
          })}
        </div>
      </div>

      <div style={{ paddingLeft: offset > 0 ? offset * 36 : 0, transition: "padding-left .3s" }}>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">pattern</div>
        <div className="flex flex-wrap gap-1">
          {pat.split("").map((ch, idx) => (
            <Cell
              key={idx}
              ch={ch}
              label={phase === "lps" ? String(lps[idx] ?? 0) : String(idx)}
              color={idx === j && phase === "search" ? C.compare : idx === num(s.lpsI, -1) && phase === "lps" ? C.compare : undefined}
              bg={idx === j && phase === "search" ? `${C.compare}28` : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill label="phase" value={phase === "lps" ? "building prefix table" : "scanning"} color={C.active} />
        {phase === "search" && <Pill label="text i" value={String(i)} color={C.compare} />}
        {phase === "search" && <Pill label="pattern j" value={String(j)} color={C.window} />}
        {"fallback" in s && <Pill label="fall back to" value={String(s.fallback)} color={C.pivot} />}
        <Pill label="matches" value={matches.length ? matches.join(", ") : "none yet"} color={C.done} />
      </div>
      {lps.length > 0 && <AuxRow label="lps" values={lps} highlight={[num(s.lpsI, -1)]} color={C.pivot} />}
    </div>
  );
}

/* ============================================================
   Dispatcher
   ============================================================ */

export function VizCanvas({ kind, frame }: { kind: VizKind; frame: VizFrame }) {
  switch (kind) {
    case "array":
      return <ArrayView frame={frame} />;
    case "grid":
      return <GridView frame={frame} />;
    case "graph":
      return <GraphView frame={frame} />;
    case "tree":
      return <TreeView frame={frame} />;
    case "linkedlist":
      return <ListView frame={frame} />;
    case "dptable":
      return <DpTableView frame={frame} />;
    case "recursion":
      return <RecursionView frame={frame} />;
    case "text":
      return <TextView frame={frame} />;
    default:
      return <pre className="p-4 text-xs text-dim">{JSON.stringify(frame.state, null, 2)}</pre>;
  }
}
