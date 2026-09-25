"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, DiffBadge, Ring, cx } from "@/components/ui/bits";
import { useNow } from "@/hooks/useNow";
import { useStore } from "@/lib/store/useStore";
import { dailyChallenge, tipOfDay, weeklyFocus } from "@/lib/engine/daily";
import { todayKey, xpForSolve } from "@/lib/engine/xp";
import { TOPIC_MAP } from "@/lib/data/topics";
import { play } from "@/lib/sound";

/**
 * The daily loop. A date-seeded challenge, a goal ring for today and one tip.
 * All three are pure functions of the day, so they never shift under you mid
 * session, and the whole card is a no-op until the clock store has hydrated.
 */

export function DailyCard() {
  const now = useNow();
  const progress = useStore((s) => s.progress);
  const dailyDone = useStore((s) => s.dailyDone);
  const claimDaily = useStore((s) => s.claimDaily);
  const days = useStore((s) => s.days);
  const goal = useStore((s) => s.settings.dailyProblems);
  const sound = useStore((s) => s.settings.sound);

  const key = useMemo(() => (now ? todayKey(new Date(now)) : ""), [now]);
  const challenge = useMemo(() => (key ? dailyChallenge(key) : null), [key]);

  if (!key || !challenge) return <div className="panel h-[168px] animate-pulse" />;

  const { problem } = challenge;
  const topic = TOPIC_MAP[problem.topic];
  const solved = progress[problem.id]?.status === "solved";
  const claimed = Boolean(dailyDone[key]);
  const base = xpForSolve(problem, { hints: 0, firstTry: false, streak: 0, underEstimate: false }).total;
  const bonusXp = Math.max(10, Math.round(base * (challenge.bonus - 1)));

  const today = days[key] ?? { solved: 0, reviewed: 0, minutes: 0, xp: 0 };
  const goalPct = goal > 0 ? Math.min(1, today.solved / goal) : 0;
  const goalMet = today.solved >= goal;

  return (
    <div className="panel relative overflow-hidden">
      {/* soft banner wash in the challenge difficulty colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{
          background: problem.difficulty === "Hard" ? "var(--hard)" : problem.difficulty === "Medium" ? "var(--medium)" : "var(--easy)",
          opacity: 0.13,
        }}
      />

      <div className="relative grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Icon name="CalendarCheck" size={11} /> {challenge.label}
            </span>
            <Chip color="var(--gold)">{challenge.bonus}x XP</Chip>
            {claimed && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-[11px] font-semibold text-easy">
                <Icon name="CheckCircle2" size={12} /> cleared
              </motion.span>
            )}
          </div>

          <Link href={`/problems/${problem.id}`} className="mt-2 block">
            <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight hover:text-accent">
              {problem.title}
              <DiffBadge d={problem.difficulty} small />
            </h3>
          </Link>

          <p className="mt-1 text-xs leading-relaxed text-dim">{challenge.blurb}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
            <span className="flex items-center gap-1">
              <Icon name={topic?.icon ?? "ListOrdered"} size={11} style={{ color: topic?.color }} />
              {topic?.name}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={11} /> {problem.est} min
            </span>
            {problem.links.lc && (
              <span className="flex items-center gap-1 font-mono">
                <Icon name="ExternalLink" size={10} /> LC {problem.links.lc}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <AnimatePresence mode="wait">
              {!solved ? (
                <motion.div key="go" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link href={`/problems/${problem.id}`} className="btn btn-primary !py-1.5 !text-xs">
                    <Icon name="Play" size={12} /> Start the challenge
                  </Link>
                </motion.div>
              ) : !claimed ? (
                <motion.button
                  key="claim"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    claimDaily(key, problem.id, bonusXp);
                    play("achieve", sound);
                  }}
                  className="btn btn-primary !py-1.5 !text-xs"
                >
                  <Icon name="Gem" size={12} /> Claim +{bonusXp} XP
                </motion.button>
              ) : (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link href={`/problems/${problem.id}`} className="btn !py-1.5 !text-xs">
                    <Icon name="RotateCcw" size={12} /> Review it
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Link href="/revise" className="btn !py-1.5 !text-xs">
              <Icon name="Repeat" size={12} /> Review queue
            </Link>
          </div>
        </div>

        {/* today's goal */}
        <div className="flex items-center gap-4 sm:flex-col sm:gap-2 sm:border-l sm:border-line-soft sm:pl-5">
          <Ring value={goalPct} size={78} stroke={7} color={goalMet ? "var(--easy)" : "var(--accent)"}>
            <div className="text-center leading-none">
              <div className="text-base font-extrabold">{today.solved}</div>
              <div className="text-[8px] uppercase tracking-wider text-faint">of {goal}</div>
            </div>
          </Ring>
          <div className="min-w-0 sm:text-center">
            <div className={cx("text-[11px] font-bold", goalMet ? "text-easy" : "text-text")}>
              {goalMet ? "Goal hit" : `${Math.max(0, goal - today.solved)} to go`}
            </div>
            <div className="text-[10px] text-faint">
              {today.minutes} min · {today.xp} XP
            </div>
          </div>
        </div>
      </div>

      <div className="hairline flex items-start gap-2 px-4 py-2.5">
        <Icon name="Lightbulb" size={13} className="mt-0.5 shrink-0 text-gold" />
        <p className="text-[11px] leading-relaxed text-dim">{tipOfDay(key)}</p>
      </div>
    </div>
  );
}

/** A topic spotlight that rotates weekly, with the matching drills attached. */
export function WeeklySpotlight() {
  const now = useNow();
  const progress = useStore((s) => s.progress);
  const focus = useMemo(() => (now ? weeklyFocus(todayKey(new Date(now))) : null), [now]);

  if (!focus) return <div className="panel h-[132px] animate-pulse" />;

  const topic = TOPIC_MAP[focus.topic];
  const done = focus.problems.filter((p) => progress[p.id]?.status === "solved").length;

  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex flex-wrap items-center gap-2 px-4 py-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${topic.color}1f`, color: topic.color }}>
          <Icon name={topic.icon} size={14} />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-faint">This week&apos;s spotlight</div>
          <div className="truncate text-sm font-bold">{topic.name}</div>
        </div>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {done}/{focus.problems.length}
        </span>
      </div>

      <div className="px-4 py-3">
        <Bar value={focus.problems.length ? done / focus.problems.length : 0} color={topic.color} height={5} />
        <p className="mt-2.5 text-[11px] leading-relaxed text-dim">{topic.blurb}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Link href={`/visualize/${focus.algo.slug}`} className="chip cursor-pointer hover:border-accent">
            <Icon name="PlayCircle" size={10} /> {focus.algo.name}
          </Link>
          <Link href={`/learn/${topic.id}`} className="chip cursor-pointer hover:border-accent">
            Topic notes →
          </Link>
        </div>
      </div>

      <div className="hairline divide-y divide-[var(--line-soft)]">
        {focus.problems.map((p) => {
          const isDone = progress[p.id]?.status === "solved";
          return (
            <Link key={p.id} href={`/problems/${p.id}`} className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-panel-2/50">
              <Icon
                name={isDone ? "CheckCircle2" : "Circle"}
                size={13}
                className={cx("shrink-0", isDone ? "text-easy" : "text-faint")}
              />
              <span className={cx("min-w-0 flex-1 truncate text-xs", isDone && "text-faint line-through")}>{p.title}</span>
              <DiffBadge d={p.difficulty} small />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
