"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, CountUp, DiffBadge, Ring, cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { dayDiff, levelFromXp, levelTitle, todayKey } from "@/lib/engine/xp";
import { masteryColor, masteryLabel, ratingBand } from "@/lib/engine/mastery";
import { TOPIC_MAP } from "@/lib/data/topics";
import { PATTERN_MAP } from "@/lib/data/patterns";
import type { SkillGap } from "@/lib/engine/recommender";
import type { Problem } from "@/lib/types";

/* --------------------------------- streak --------------------------------- */

export function StreakCard() {
  const hydrated = useHydrated();
  const streak = useStore((s) => s.streak);
  const days = useStore((s) => s.days);
  const goal = useStore((s) => s.settings.dailyProblems);
  const today = days[todayKey()];
  const solvedToday = hydrated ? (today?.solved ?? 0) : 0;
  const pct = Math.min(1, solvedToday / Math.max(1, goal));

  const last7 = useMemo(() => {
    const out: { date: string; solved: number; frozen: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      out.push({ date: key, solved: days[key]?.solved ?? 0, frozen: streak.frozen?.includes(key) ?? false });
    }
    return out;
  }, [days, streak.frozen]);

  return (
    <div className="panel panel-hover relative overflow-hidden p-4">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(255,138,61,.28), transparent 70%)" }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Streak</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-streak">
              <CountUp to={hydrated ? streak.current : 0} />
            </span>
            <span className="text-sm text-dim">day{streak.current === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-faint">
            Best {hydrated ? streak.best : 0} · {hydrated ? streak.freezes : 0} freeze
            {streak.freezes === 1 ? "" : "s"} left
          </div>
        </div>
        <Icon name="Flame" size={30} className={cx("text-streak", hydrated && streak.current > 0 && "animate-flame")} />
      </div>

      <div className="relative mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-dim">Today</span>
          <span className="font-mono text-faint">
            {solvedToday} / {goal}
          </span>
        </div>
        <Bar value={pct} color="var(--streak)" height={6} />
      </div>

      <div className="relative mt-3 flex gap-1">
        {last7.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            <div
              className="h-7 rounded-md border"
              style={{
                background: d.frozen
                  ? "rgba(52,211,255,.18)"
                  : d.solved >= goal
                    ? "var(--streak)"
                    : d.solved > 0
                      ? "rgba(255,138,61,.35)"
                      : "var(--panel-2)",
                borderColor: d.frozen ? "rgba(52,211,255,.5)" : "var(--border-soft)",
              }}
              title={`${d.date}: ${d.solved} solved${d.frozen ? " (freeze used)" : ""}`}
            />
            <span className="mt-0.5 block text-[9px] text-faint">
              {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- level --------------------------------- */

export function LevelCard() {
  const hydrated = useHydrated();
  const xp = useStore((s) => s.xp);
  const rating = useStore((s) => s.rating);
  const lvl = levelFromXp(hydrated ? xp : 0);
  return (
    <div className="panel panel-hover flex items-center gap-4 p-4">
      <Ring value={lvl.pct} size={74} stroke={7} color="var(--accent)">
        <div className="text-center leading-none">
          <div className="text-lg font-extrabold">{lvl.level}</div>
          <div className="text-[8px] uppercase tracking-wider text-faint">level</div>
        </div>
      </Ring>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{levelTitle(lvl.level)}</div>
        <div className="mt-0.5 font-mono text-[11px] text-faint">
          {lvl.into} / {lvl.span} XP to level {lvl.level + 1}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Icon name="Gauge" size={12} className="text-accent-3" />
          <span className="font-mono text-xs font-bold">{hydrated ? rating : 1200}</span>
          <Chip color="var(--accent-3)" className="!text-[9px]">
            {ratingBand(hydrated ? rating : 1200)}
          </Chip>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ recommendation ----------------------------- */

export function RecommendationCard({
  problem,
  reason,
  score,
  rank,
}: {
  problem: Problem;
  reason: string;
  score: number;
  rank: number;
}) {
  const topic = TOPIC_MAP[problem.topic];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Link
        href={`/problems/${problem.id}`}
        className="panel panel-hover flex h-full flex-col gap-2 p-3.5"
        style={{ borderLeft: `3px solid ${topic?.color ?? "var(--accent)"}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-snug">{problem.title}</span>
          <DiffBadge d={problem.difficulty} small />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip color={topic?.color}>{topic?.name}</Chip>
          <Chip icon="Clock">{problem.est}m</Chip>
          {problem.must && <Chip color="var(--gold)" icon="Star">must do</Chip>}
        </div>
        <p className="mt-auto flex items-start gap-1.5 text-[11px] leading-snug text-dim">
          <Icon name="Sparkles" size={11} className="mt-0.5 shrink-0 text-accent" />
          {reason}
        </p>
        <div className="flex items-center gap-2">
          <Bar value={score} height={3} />
          <span className="font-mono text-[9px] text-faint">{Math.round(score * 100)}</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------- skill gaps ------------------------------- */

export function SkillGapList({ gaps }: { gaps: SkillGap[] }) {
  return (
    <div className="panel divide-y divide-line-soft">
      {gaps.map((g) => {
        const href = g.kind === "topic" ? `/learn/${g.id}` : `/learn/pattern/${g.id}`;
        const name = g.kind === "topic" ? (TOPIC_MAP[g.id]?.name ?? g.name) : (PATTERN_MAP[g.id]?.name ?? g.name);
        return (
          <Link key={`${g.kind}-${g.id}`} href={href} className="flex items-center gap-3 p-3 transition-colors hover:bg-panel-2/60">
            <Ring value={g.mastery} size={38} stroke={4} color={masteryColor(g.mastery)}>
              <span className="text-[9px] font-bold">{Math.round(g.mastery * 100)}</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="text-[11px] text-faint">
                {masteryLabel(g.mastery)} · {g.seen === 0 ? "not practised yet" : `${g.seen} attempt${g.seen === 1 ? "" : "s"}`}
              </div>
            </div>
            <Chip className="!text-[9px]">{g.kind}</Chip>
            <Icon name="ChevronRight" size={14} className="shrink-0 text-faint" />
          </Link>
        );
      })}
    </div>
  );
}

/* --------------------------------- heatmap -------------------------------- */

export function Heatmap({ weeks = 26 }: { weeks?: number }) {
  const days = useStore((s) => s.days);
  const hydrated = useHydrated();
  const goal = useStore((s) => s.settings.dailyProblems);

  const grid = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    // walk back to the most recent Sunday so columns line up as weeks
    end.setDate(end.getDate() + (6 - end.getDay()));
    const cells: { key: string; solved: number; future: boolean }[] = [];
    const total = weeks * 7;
    for (let i = total - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      cells.push({
        key,
        solved: hydrated ? (days[key]?.solved ?? 0) : 0,
        future: dayDiff(todayKey(today), key) > 0,
      });
    }
    const cols: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [days, weeks, hydrated]);

  const shade = (n: number) => {
    if (n === 0) return "var(--panel-2)";
    const t = Math.min(1, n / Math.max(2, goal));
    return `color-mix(in srgb, var(--accent) ${25 + t * 70}%, var(--panel-2))`;
  };

  return (
    <div className="panel overflow-x-auto p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Icon name="CalendarCheck" size={14} className="text-accent" /> Activity
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-faint">
          less
          {[0, 1, 2, 3].map((n) => (
            <span key={n} className="h-2.5 w-2.5 rounded-sm" style={{ background: shade(n * goal * 0.5) }} />
          ))}
          more
        </div>
      </div>
      <div className="flex gap-[3px]">
        {grid.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <div
                key={c.key}
                title={`${c.key}: ${c.solved} solved`}
                className="h-[11px] w-[11px] rounded-[3px] transition-transform hover:scale-125"
                style={{ background: c.future ? "transparent" : shade(c.solved), opacity: c.future ? 0.25 : 1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ mastery radar ------------------------------ */

export function MasteryRadar({
  data,
  size = 260,
}: {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}) {
  const n = data.length;
  if (n < 3) return null;
  const cx0 = size / 2;
  const cy0 = size / 2;
  const r = size / 2 - 34;
  const pt = (i: number, v: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx0 + Math.cos(a) * r * v, cy0 + Math.sin(a) * r * v] as const;
  };
  const poly = data.map((d, i) => pt(i, Math.max(0.04, d.value)).join(",")).join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={data.map((_, i) => pt(i, ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx0} y1={cy0} x2={x} y2={y} stroke="var(--border-soft)" strokeWidth={1} />;
      })}
      <motion.polygon
        points={poly}
        fill="rgba(109,94,252,.22)"
        stroke="var(--accent)"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
      />
      {data.map((d, i) => {
        const [x, y] = pt(i, Math.max(0.04, d.value));
        return <circle key={i} cx={x} cy={y} r={3} fill={d.color ?? "var(--accent)"} />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.19);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={x < cx0 - 6 ? "end" : x > cx0 + 6 ? "start" : "middle"}
            dominantBaseline="middle"
            fontSize={9.5}
            fill="var(--text-dim)"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
