import type { Difficulty, Problem, TopicId } from "@/lib/types";
import { PROBLEMS } from "@/lib/data/problems";
import { TOPICS } from "@/lib/data/topics";
import { ALGOS } from "@/lib/algo/registry";
import type { VizAlgo } from "@/lib/types";

/**
 * The daily challenge deliberately ignores your progress. If the pick depended
 * on what you had solved, it would change the moment you solved something and
 * the card would feel broken. A pure function of the date is stable all day and
 * gives everyone the same problem, which is what makes a daily mean anything.
 */

/** FNV-1a. Small, fast, and spreads adjacent date strings apart. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A deterministic index into a list of length n, seeded by a string. */
const pick = (seed: string, n: number): number => (n > 0 ? hashString(seed) % n : 0);

const DAY_THEME: { difficulty: Difficulty; label: string; blurb: string }[] = [
  { difficulty: "Easy", label: "Warm-up Sunday", blurb: "One clean easy problem. Protect the streak, keep the hands moving." },
  { difficulty: "Medium", label: "Pattern Monday", blurb: "A medium that rewards recognising the pattern before writing code." },
  { difficulty: "Medium", label: "Build-up Tuesday", blurb: "A medium from the core interview set." },
  { difficulty: "Hard", label: "Hard Wednesday", blurb: "A hard mid-week. Spend ten minutes on the idea before you type." },
  { difficulty: "Medium", label: "Throughput Thursday", blurb: "A medium you should be able to finish inside the estimate." },
  { difficulty: "Medium", label: "Interview Friday", blurb: "A frequently asked medium. Say your approach out loud first." },
  { difficulty: "Hard", label: "Deep Saturday", blurb: "A hard with room to think. No time pressure today." },
];

export interface DailyChallenge {
  problem: Problem;
  label: string;
  blurb: string;
  /** Multiplier applied to the XP earned for solving it today. */
  bonus: number;
  dateKey: string;
}

/**
 * Pool is restricted to problems that actually appear in interviews, sorted by
 * id so the ordering never depends on how the data files happen to be loaded.
 */
function poolFor(difficulty: Difficulty): Problem[] {
  const pool = PROBLEMS.filter((p) => p.difficulty === difficulty && p.freq >= 3 && p.tier <= 450 && !p.premium);
  return pool.length ? pool.slice().sort((a, b) => (a.id < b.id ? -1 : 1)) : PROBLEMS.slice(0, 1);
}

/** The previous calendar day's key, or "" when the date cannot be parsed. */
function yesterdayKey(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dailyChallenge(dateKey: string): DailyChallenge {
  // dateKey is YYYY-MM-DD, so parsing at noon avoids any timezone drift.
  const weekday = new Date(`${dateKey}T12:00:00`).getDay();
  const theme = DAY_THEME[Number.isNaN(weekday) ? 1 : weekday];
  const pool = poolFor(theme.difficulty);

  let i = pick(`${dateKey}|daily`, pool.length);
  // Mon/Tue and Thu/Fri draw from the same pool, so back to back days can land
  // on the same problem by coincidence. Nudging by one keeps the function pure
  // while making a repeat impossible. Yesterday is read unguarded, so this
  // never recurses.
  const prev = yesterdayKey(dateKey);
  if (prev && pool.length > 1) {
    const prevWeekday = new Date(`${prev}T12:00:00`).getDay();
    if (DAY_THEME[prevWeekday].difficulty === theme.difficulty && pick(`${prev}|daily`, pool.length) === i) {
      i = (i + 1) % pool.length;
    }
  }

  return {
    problem: pool[i],
    label: theme.label,
    blurb: theme.blurb,
    bonus: theme.difficulty === "Hard" ? 2 : 1.5,
    dateKey,
  };
}

/** ISO week number, used to seed anything that should rotate weekly. */
export function weekKey(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day + 3); // nearest Thursday
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000);
  return `${d.getFullYear()}-W${week}`;
}

export interface WeeklyFocus {
  topic: TopicId;
  algo: VizAlgo;
  problems: Problem[];
  weekKey: string;
}

/** A topic spotlight that rotates every week, with matching drills. */
export function weeklyFocus(dateKey: string): WeeklyFocus {
  const wk = weekKey(dateKey);
  const heavy = TOPICS.filter((t) => t.interviewWeight >= 0.6).sort((a, b) => a.order - b.order);
  const topic = heavy[pick(`${wk}|focus`, heavy.length)];
  const algos = ALGOS.filter((a) => a.topic === topic.id);
  const fallback = ALGOS[pick(`${wk}|algo`, ALGOS.length)];
  return {
    topic: topic.id,
    algo: algos.length ? algos[pick(`${wk}|algo`, algos.length)] : fallback,
    problems: PROBLEMS.filter((p) => p.topic === topic.id && p.tier <= 250)
      .slice()
      .sort((a, b) => b.freq - a.freq || (a.id < b.id ? -1 : 1))
      .slice(0, 5),
    weekKey: wk,
  };
}

/** Deterministic rotating tip shown in the shell. Pure so SSR matches. */
export const TIPS: string[] = [
  "Say the brute force out loud first. Interviewers grade the path, not just the destination.",
  "State the invariant before you write the loop. Most off-by-one bugs are an unstated invariant.",
  "If a problem mentions 'contiguous', reach for sliding window or prefix sum before anything else.",
  "When greedy feels risky, try to break it with a counterexample. If you cannot, it is probably right.",
  "Sort first is a legitimate move. It costs O(n log n) and unlocks two pointers and binary search.",
  "Write the recursion, then memoise, then flip to a table. Never start from the table.",
  "A dummy head node removes almost every linked list edge case.",
  "For tree problems, ask what each child must return to its parent. That is your state.",
  "Monotonic stack is the answer to nearly every 'next greater element' variation.",
  "Binary search works on any monotonic predicate, not only on sorted arrays.",
  "Dry-run your code on the smallest failing input before claiming it works.",
  "Space optimisation comes last. A correct O(n^2) beats a broken O(n).",
  "If you are stuck for ten minutes, read the constraints again. They usually name the algorithm.",
  "Hash maps turn 'find the pair' into one pass. Always ask what you would want to look up.",
  "Explain your complexity as you write, not after. It catches accidental nested loops.",
];

export const tipOfDay = (dateKey: string): string => TIPS[pick(`${dateKey}|tip`, TIPS.length)];
