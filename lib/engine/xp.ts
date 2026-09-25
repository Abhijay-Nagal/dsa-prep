import type { Difficulty, Problem } from "@/lib/types";

/* ============================================================
   XP, levels and streaks
   ============================================================ */

const BASE_XP: Record<Difficulty, number> = { Easy: 20, Medium: 45, Hard: 90 };

export interface XpBreakdown {
  total: number;
  parts: { label: string; amount: number }[];
}

export function xpForSolve(
  p: Problem,
  opts: { hints: number; firstTry: boolean; streak: number; underEstimate: boolean; review?: boolean },
): XpBreakdown {
  const parts: { label: string; amount: number }[] = [];
  const base = opts.review ? Math.round(BASE_XP[p.difficulty] * 0.4) : BASE_XP[p.difficulty];
  parts.push({ label: opts.review ? "Review" : `${p.difficulty} solve`, amount: base });

  if (p.must && !opts.review) parts.push({ label: "Must-do problem", amount: 15 });
  if (opts.hints === 0 && !opts.review) parts.push({ label: "No hints", amount: Math.round(base * 0.3) });
  else if (opts.hints > 0) parts.push({ label: `${opts.hints} hint${opts.hints > 1 ? "s" : ""} used`, amount: -Math.min(base * 0.4, opts.hints * 8) });
  if (opts.firstTry && !opts.review) parts.push({ label: "First attempt", amount: 10 });
  if (opts.underEstimate && !opts.review) parts.push({ label: "Beat the clock", amount: 12 });

  const streakMult = streakMultiplier(opts.streak);
  const subtotal = parts.reduce((s, x) => s + x.amount, 0);
  if (streakMult > 1) {
    parts.push({ label: `${opts.streak}-day streak bonus`, amount: Math.round(subtotal * (streakMult - 1)) });
  }
  return { total: Math.max(5, Math.round(parts.reduce((s, x) => s + x.amount, 0))), parts };
}

export const streakMultiplier = (streak: number) =>
  streak >= 100 ? 1.6 : streak >= 60 ? 1.5 : streak >= 30 ? 1.4 : streak >= 14 ? 1.3 : streak >= 7 ? 1.2 : streak >= 3 ? 1.1 : 1;

/** Cumulative XP needed to reach a level. Superlinear so later levels feel earned. */
export const xpForLevel = (level: number) => Math.round(120 * Math.pow(Math.max(1, level) - 1, 1.55));

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 200) level++;
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    into: xp - cur,
    span: Math.max(1, next - cur),
    pct: Math.min(1, (xp - cur) / Math.max(1, next - cur)),
    next,
  };
}

export const LEVEL_TITLES = [
  "Newcomer", "Array Apprentice", "Loop Learner", "Pointer Pupil", "Recursion Rookie",
  "Hash Hunter", "Stack Scholar", "Tree Tender", "Graph Navigator", "Heap Handler",
  "Window Watcher", "Binary Seeker", "Greedy Guru", "Memo Mechanic", "State Sculptor",
  "Pattern Prophet", "Complexity Captain", "Edge Case Enforcer", "Interview Ready", "Whiteboard Warrior",
  "Optimal Only", "Bar Raiser", "Algorithm Architect", "Grandmaster",
];

export const levelTitle = (level: number) =>
  LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2))];

/* ------------------------------- streak logic ------------------------------ */

export const todayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86_400_000);

export interface StreakState {
  current: number;
  best: number;
  lastActive: string | null;
  freezes: number;
  /** Days on which a freeze was spent, so the heatmap can show them. */
  frozen: string[];
}

export const emptyStreak = (): StreakState => ({ current: 0, best: 0, lastActive: null, freezes: 2, frozen: [] });

/**
 * Roll the streak forward for activity on `day`.
 * A single missed day is absorbed by a freeze if one is available.
 */
export function bumpStreak(s: StreakState, day = todayKey()): StreakState {
  if (s.lastActive === day) return s;
  if (!s.lastActive) return { ...s, current: 1, best: Math.max(1, s.best), lastActive: day };

  const gap = dayDiff(s.lastActive, day);
  if (gap === 1) {
    const current = s.current + 1;
    return {
      ...s,
      current,
      best: Math.max(s.best, current),
      lastActive: day,
      // one freeze restored every 10 days of streak, capped at 3
      freezes: current % 10 === 0 ? Math.min(3, s.freezes + 1) : s.freezes,
    };
  }
  if (gap === 2 && s.freezes > 0) {
    const missed = new Date(new Date(day).getTime() - 86_400_000).toISOString().slice(0, 10);
    const current = s.current + 1;
    return {
      ...s,
      current,
      best: Math.max(s.best, current),
      lastActive: day,
      freezes: s.freezes - 1,
      frozen: [...s.frozen, missed],
    };
  }
  return { ...s, current: 1, lastActive: day, best: Math.max(s.best, 1) };
}

/** Recompute a stale streak on app load, without recording activity. */
export function settleStreak(s: StreakState, day = todayKey()): StreakState {
  if (!s.lastActive) return s;
  const gap = dayDiff(s.lastActive, day);
  if (gap <= 1) return s;
  if (gap === 2 && s.freezes > 0) return s; // still salvageable today
  return { ...s, current: 0 };
}
