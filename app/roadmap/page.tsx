"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, SectionTitle, cx } from "@/components/ui/bits";
import { useSnapshot, useTotals } from "@/hooks/useLearner";
import { TOPICS, TOPIC_MAP } from "@/lib/data/topics";
import { PROBLEMS } from "@/lib/data/problems";
import { getMastery } from "@/lib/engine/recommender";
import { masteryLabel } from "@/lib/engine/mastery";
import type { TopicId } from "@/lib/types";

/**
 * The syllabus as a prerequisite graph rather than a list, because the order
 * matters more than the contents: sliding window before you own two pointers is
 * wasted effort. Layers come from the longest path to a root, so a topic always
 * sits below everything it depends on.
 */

const NODE_W = 132;
const NODE_H = 54;
const COL_GAP = 26;
const ROW_GAP = 74;

interface Node {
  id: TopicId;
  x: number;
  y: number;
  layer: number;
}

function buildLayout() {
  // Seed every topic at layer 0. Without this, a root's entry is never written
  // (its wanted layer already equals the `?? 0` default) and the lookup below
  // reads undefined.
  const layer: Record<string, number> = {};
  for (const t of TOPICS) layer[t.id] = 0;

  // Longest path to a root. Repeat until stable; the graph is tiny and acyclic.
  for (let pass = 0; pass < TOPICS.length; pass++) {
    let changed = false;
    for (const t of TOPICS) {
      const want = t.prereq.length ? Math.max(...t.prereq.map((p) => layer[p] + 1)) : 0;
      if (want !== layer[t.id]) {
        layer[t.id] = want;
        changed = true;
      }
    }
    if (!changed) break;
  }

  const rows = Math.max(...Object.values(layer)) + 1;
  const byLayer: TopicId[][] = Array.from({ length: rows }, () => []);
  for (const t of [...TOPICS].sort((a, b) => a.order - b.order)) byLayer[layer[t.id]].push(t.id);

  const widest = Math.max(...byLayer.map((r) => r.length));
  const width = widest * (NODE_W + COL_GAP);
  const nodes: Node[] = [];
  byLayer.forEach((row, li) => {
    const rowWidth = row.length * (NODE_W + COL_GAP);
    const offset = (width - rowWidth) / 2;
    row.forEach((id, i) => {
      nodes.push({ id, layer: li, x: offset + i * (NODE_W + COL_GAP) + COL_GAP / 2, y: li * (NODE_H + ROW_GAP) + 16 });
    });
  });

  const pos: Record<string, Node> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = TOPICS.flatMap((t) => t.prereq.map((p) => ({ from: p as TopicId, to: t.id })));
  return { nodes, edges, pos, width, height: rows * (NODE_H + ROW_GAP) + 16, rows };
}

/** Everything `id` transitively depends on. */
function ancestors(id: TopicId): Set<string> {
  const out = new Set<string>();
  const stack = [...(TOPIC_MAP[id]?.prereq ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (out.has(cur)) continue;
    out.add(cur);
    stack.push(...(TOPIC_MAP[cur]?.prereq ?? []));
  }
  return out;
}

/** Everything that transitively depends on `id`. */
function descendants(id: TopicId): Set<string> {
  const out = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of TOPICS) {
      if (out.has(t.id)) continue;
      if (t.prereq.some((p) => p === id || out.has(p))) {
        out.add(t.id);
        grew = true;
      }
    }
  }
  return out;
}

export default function RoadmapPage() {
  const snap = useSnapshot();
  const totals = useTotals();
  const [hover, setHover] = useState<TopicId | null>(null);
  const layoutData = useMemo(() => buildLayout(), []);

  const mastery = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of TOPICS) m[t.id] = getMastery(snap, t.id).p;
    return m;
  }, [snap]);

  const counts = useMemo(() => {
    const total: Record<string, number> = {};
    for (const p of PROBLEMS) total[p.topic] = (total[p.topic] ?? 0) + 1;
    return total;
  }, []);

  /** A topic is gated while any prerequisite is still below a working grasp. */
  const locked = useMemo(() => {
    const l: Record<string, string[]> = {};
    for (const t of TOPICS) l[t.id] = t.prereq.filter((p) => mastery[p] < 0.3);
    return l;
  }, [mastery]);

  const highlight = useMemo(() => {
    if (!hover) return null;
    return { up: ancestors(hover), down: descendants(hover) };
  }, [hover]);

  const nextUp = useMemo(
    () =>
      [...TOPICS]
        .filter((t) => locked[t.id].length === 0 && mastery[t.id] < 0.7)
        .sort((a, b) => (0.7 - mastery[b.id]) * b.interviewWeight - (0.7 - mastery[a.id]) * a.interviewWeight)
        .slice(0, 3),
    [locked, mastery],
  );

  const started = TOPICS.filter((t) => (totals.byTopic[t.id] ?? 0) > 0).length;
  const owned = TOPICS.filter((t) => mastery[t.id] >= 0.7).length;

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <SectionTitle
        icon="Map"
        title="Syllabus roadmap"
        sub="Every topic and what it depends on. Layers run top to bottom, so nothing above you is optional."
        right={
          <div className="flex gap-2">
            <Chip color="var(--easy)">{owned} owned</Chip>
            <Chip color="var(--accent)">{started} started</Chip>
            <Chip>{TOPICS.length} total</Chip>
          </div>
        }
      />

      {nextUp.length > 0 && (
        <div className="panel flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <Icon name="Compass" size={16} className="text-accent" />
            <span className="text-sm font-semibold">Unlocked and worth doing next</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nextUp.map((t) => (
              <Link
                key={t.id}
                href={`/learn/${t.id}`}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-panel-2 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-accent"
              >
                <Icon name={t.icon} size={13} style={{ color: t.color }} />
                {t.name}
                <span className="font-mono text-[10px] text-faint">{Math.round(mastery[t.id] * 100)}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* the graph */}
      <div className="panel overflow-hidden">
        <div className="hairline flex flex-wrap items-center gap-3 px-4 py-2.5 text-[11px] text-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--easy)" }} /> owned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} /> in progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--panel-2)" }} /> untouched
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="Lock" size={11} /> prerequisites not ready
          </span>
          <span className="ml-auto hidden sm:inline">Hover a topic to trace what it needs and what it unlocks</span>
        </div>

        <div className="overflow-x-auto p-4">
          <svg
            viewBox={`0 0 ${layoutData.width} ${layoutData.height}`}
            style={{ minWidth: Math.min(layoutData.width, 980), width: "100%", height: "auto" }}
            role="img"
            aria-label="Topic prerequisite graph"
          >
            {/* edges first so nodes paint over them */}
            {layoutData.edges.map((e, i) => {
              const a = layoutData.pos[e.from];
              const b = layoutData.pos[e.to];
              if (!a || !b) return null;
              const x1 = a.x + NODE_W / 2;
              const y1 = a.y + NODE_H;
              const x2 = b.x + NODE_W / 2;
              const y2 = b.y;
              const mid = (y1 + y2) / 2;
              const lit =
                !highlight ||
                ((highlight.up.has(e.from) || e.from === hover) && (highlight.up.has(e.to) || e.to === hover)) ||
                ((highlight.down.has(e.to) || e.to === hover) && (highlight.down.has(e.from) || e.from === hover));
              return (
                <motion.path
                  key={`${e.from}-${e.to}`}
                  d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
                  fill="none"
                  stroke={lit ? TOPIC_MAP[e.from].color : "var(--line)"}
                  strokeWidth={lit ? 1.8 : 1}
                  strokeOpacity={highlight ? (lit ? 0.85 : 0.15) : 0.4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: Math.min(0.5, i * 0.012), ease: "easeOut" }}
                />
              );
            })}

            {layoutData.nodes.map((n, i) => {
              const t = TOPIC_MAP[n.id];
              const m = mastery[n.id];
              const solved = totals.byTopic[n.id] ?? 0;
              const gate = locked[n.id];
              const dim = highlight ? !(n.id === hover || highlight.up.has(n.id) || highlight.down.has(n.id)) : false;
              const fill = m >= 0.7 ? "var(--easy)" : m > 0.05 ? t.color : "var(--panel-2)";
              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: dim ? 0.25 : 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(0.45, i * 0.018) }}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <a href={`/learn/${n.id}`} aria-label={`${t.name}, ${Math.round(m * 100)} percent mastery`}>
                    <rect
                      x={n.x}
                      y={n.y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={12}
                      fill="var(--panel)"
                      stroke={n.id === hover ? t.color : "var(--line)"}
                      strokeWidth={n.id === hover ? 2 : 1}
                    />
                    {/* mastery fill along the bottom edge */}
                    <clipPath id={`clip-${n.id}`}>
                      <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={12} />
                    </clipPath>
                    <g clipPath={`url(#clip-${n.id})`}>
                      <motion.rect
                        x={n.x}
                        y={n.y + NODE_H - 4}
                        height={4}
                        fill={fill}
                        initial={{ width: 0 }}
                        animate={{ width: NODE_W * Math.max(0.02, m) }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </g>
                    <text x={n.x + 11} y={n.y + 21} fontSize={11} fontWeight={700} fill="var(--text)">
                      {t.name.length > 16 ? `${t.name.slice(0, 15)}…` : t.name}
                    </text>
                    <text x={n.x + 11} y={n.y + 38} fontSize={9.5} fill="var(--faint)">
                      {solved}/{counts[n.id] ?? 0} solved
                    </text>
                    {gate.length > 0 && m < 0.3 && (
                      <g transform={`translate(${n.x + NODE_W - 20}, ${n.y + 11})`}>
                        <circle cx={5} cy={5} r={8} fill="var(--panel-2)" />
                        <text x={5} y={8.5} fontSize={9} textAnchor="middle" fill="var(--faint)">
                          ⚿
                        </text>
                      </g>
                    )}
                    {m >= 0.7 && (
                      <circle cx={n.x + NODE_W - 13} cy={n.y + 14} r={5} fill="var(--easy)" />
                    )}
                  </a>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {hover && (
          <div className="hairline flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[11px]">
            <span className="font-semibold" style={{ color: TOPIC_MAP[hover].color }}>
              {TOPIC_MAP[hover].name}
            </span>
            <span className="text-dim">{masteryLabel(mastery[hover])}</span>
            <span className="text-faint">
              needs {TOPIC_MAP[hover].prereq.length ? TOPIC_MAP[hover].prereq.map((p) => TOPIC_MAP[p].name).join(", ") : "nothing"}
            </span>
            <span className="text-faint">unlocks {descendants(hover).size} later topics</span>
          </div>
        )}
      </div>

      {/* linear view, which is also the mobile-friendly one */}
      <section>
        <SectionTitle icon="ListOrdered" title="The same path as a checklist" sub="Ordered by prerequisite depth, then by how often the topic shows up in interviews." />
        <div className="panel divide-y divide-[var(--line-soft)]">
          {layoutData.nodes.map((n) => {
            const t = TOPIC_MAP[n.id];
            const m = mastery[n.id];
            const solved = totals.byTopic[n.id] ?? 0;
            const gate = locked[n.id];
            return (
              <Link key={n.id} href={`/learn/${n.id}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-panel-2/50">
                <span className="w-5 text-center font-mono text-[10px] text-faint">{n.layer + 1}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${t.color}1a`, color: t.color }}>
                  <Icon name={t.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{t.name}</span>
                    {gate.length > 0 && m < 0.3 && (
                      <span className="flex items-center gap-1 text-[10px] text-faint">
                        <Icon name="Lock" size={9} /> after {gate.map((g) => TOPIC_MAP[g].name).join(" + ")}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block max-w-md">
                    <Bar value={m} color={t.color} height={4} />
                  </span>
                </span>
                <span className="hidden w-28 shrink-0 text-right text-[11px] text-faint sm:block">{masteryLabel(m)}</span>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-faint">
                  {solved}/{counts[n.id] ?? 0}
                </span>
                <Icon name="ChevronRight" size={14} className={cx("shrink-0 text-faint")} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
