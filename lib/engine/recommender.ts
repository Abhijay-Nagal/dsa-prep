import type { MasteryState, Problem, ProblemProgress, Tier, TopicId } from "@/lib/types";
import { PROBLEMS, problemsInTier } from "@/lib/data/problems";
import { COMPANY_MAP } from "@/lib/data/companies";
import { TOPICS, TOPIC_MAP } from "@/lib/data/topics";
import { decayed, emptyMastery, expectedScore, predictCorrect, problemRating } from "./mastery";
import { isDue, retrievability } from "./srs";

export interface LearnerSnapshot {
  progress: Record<string, ProblemProgress>;
  mastery: Record<string, MasteryState>;
  rating: number;
  tier: Tier;
  targetCompany?: string;
  now: number;
}

export const getMastery = (snap: LearnerSnapshot, key: string): MasteryState =>
  decayed(snap.mastery[key] ?? emptyMastery(), snap.now);

const isSolved = (snap: LearnerSnapshot, id: string) => snap.progress[id]?.status === "solved";

/**
 * Average mastery across the patterns a problem exercises.
 * A problem is only as approachable as its weakest required pattern.
 */
export function readinessFor(snap: LearnerSnapshot, p: Problem): number {
  if (!p.patterns.length) return getMastery(snap, p.topic).p;
  const vals = p.patterns.map((pat) => predictCorrect(getMastery(snap, pat)));
  const min = Math.min(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return 0.6 * min + 0.4 * avg;
}

/**
 * Value of attempting this problem right now, on a 0..1 scale.
 *
 * The centrepiece is the zone of proximal development: the best problem is the
 * one you have roughly a 70% chance of solving. Far below that is frustrating,
 * far above is a waste of a rep. Everything else nudges that base score.
 */
export function scoreProblem(snap: LearnerSnapshot, p: Problem): number {
  if (isSolved(snap, p.id)) return 0;

  const readiness = readinessFor(snap, p);
  // gaussian peak at the target success probability
  const TARGET = 0.7;
  const zpd = Math.exp(-Math.pow(readiness - TARGET, 2) / (2 * 0.18 * 0.18));

  // rating fit: prefer problems near the learner's Elo
  const rating = problemRating(p.difficulty, p.freq, p.tier);
  const fit = 1 - Math.abs(expectedScore(snap.rating, rating) - 0.65) * 1.4;

  // interview payoff
  const importance = (p.freq / 5) * 0.6 + (p.must ? 0.4 : 0);

  // sheet phase: problems inside the active sheet come first
  const inSheet = p.tier <= snap.tier ? 1 : 0.35;

  // company alignment
  let company = 0.5;
  if (snap.targetCompany) {
    const c = COMPANY_MAP[snap.targetCompany];
    const tagged = p.companies.includes(snap.targetCompany) ? 1 : 0;
    const focus = c?.focus?.[p.topic] ?? 0.2;
    company = 0.55 * tagged + 0.45 * focus;
  }

  // prerequisite gating: do not push a topic whose prerequisites are unlearned
  const topic = TOPIC_MAP[p.topic];
  const prereqReady = topic?.prereq.length
    ? topic.prereq.reduce((m, id) => Math.min(m, getMastery(snap, id).p), 1)
    : 1;
  const gate = 0.45 + 0.55 * Math.min(1, prereqReady / 0.55);

  // a previously attempted but unsolved problem deserves another go
  const unfinished = snap.progress[p.id]?.status === "attempted" ? 1.15 : 1;
  const flagged = snap.progress[p.id]?.status === "revisit" ? 1.25 : 1;

  const base =
    0.34 * zpd +
    0.14 * Math.max(0, fit) +
    0.22 * importance +
    0.14 * company +
    0.16 * inSheet;

  return Math.max(0, Math.min(1, base * gate * unfinished * flagged));
}

export interface Recommendation {
  problem: Problem;
  score: number;
  reason: string;
}

function reasonFor(snap: LearnerSnapshot, p: Problem): string {
  const readiness = readinessFor(snap, p);
  const weakest = p.patterns
    .map((id) => ({ id, m: getMastery(snap, id).p }))
    .sort((a, b) => a.m - b.m)[0];
  if (snap.progress[p.id]?.status === "revisit") return "You flagged this one to revisit";
  if (snap.progress[p.id]?.status === "attempted") return "You started this and did not finish it";
  if (weakest && weakest.m < 0.4) return `Builds your weakest pattern right now`;
  if (readiness > 0.85) return "Quick win to keep the streak moving";
  if (p.must) return "Non-negotiable interview classic";
  if (snap.targetCompany && p.companies.includes(snap.targetCompany))
    return `Tagged by ${COMPANY_MAP[snap.targetCompany]?.name ?? "your target company"}`;
  if (readiness < 0.5) return "A stretch, but the prerequisites are in place";
  return "Right at the edge of what you can solve";
}

/** Top-N next problems, with pattern diversity so the list is not all one topic. */
export function recommend(snap: LearnerSnapshot, n = 8): Recommendation[] {
  const pool = PROBLEMS.filter((p) => !isSolved(snap, p.id));
  const scored = pool
    .map((p) => ({ problem: p, score: scoreProblem(snap, p), reason: "" }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 160);

  const out: Recommendation[] = [];
  const topicCount: Record<string, number> = {};
  const patternCount: Record<string, number> = {};
  for (const cand of scored) {
    if (out.length >= n) break;
    const tc = topicCount[cand.problem.topic] ?? 0;
    const pc = Math.max(0, ...cand.problem.patterns.map((x) => patternCount[x] ?? 0));
    if (tc >= 2 || pc >= 2) continue;
    topicCount[cand.problem.topic] = tc + 1;
    for (const x of cand.problem.patterns) patternCount[x] = (patternCount[x] ?? 0) + 1;
    out.push({ ...cand, reason: reasonFor(snap, cand.problem) });
  }
  // top up if diversity filtering starved the list
  for (const cand of scored) {
    if (out.length >= n) break;
    if (out.some((o) => o.problem.id === cand.problem.id)) continue;
    out.push({ ...cand, reason: reasonFor(snap, cand.problem) });
  }
  return out;
}

/* ============================================================
   Daily plan: a 0/1 knapsack over the minutes you actually have
   ============================================================ */

export interface DailyPlan {
  reviews: Problem[];
  newWork: Problem[];
  stretch?: Problem;
  minutes: number;
  reviewMinutes: number;
  /** Fraction of the requested budget the plan actually fills. */
  fill: number;
}

/** Classic 0/1 knapsack, value scaled to integers for a clean DP table. */
function knapsack(items: { p: Problem; value: number; weight: number }[], capacity: number): Problem[] {
  const cap = Math.max(0, Math.floor(capacity));
  if (!items.length || cap === 0) return [];
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const { value, weight } = items[i - 1];
    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weight <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + value);
    }
  }
  const chosen: Problem[] = [];
  let w = cap;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(items[i - 1].p);
      w -= items[i - 1].weight;
    }
  }
  return chosen.reverse();
}

export function dailyPlan(snap: LearnerSnapshot, minutes = 90): DailyPlan {
  // 1. Reviews come first: forgetting is more expensive than not learning.
  const reviews = PROBLEMS.filter((p) => isDue(snap.progress[p.id]?.srs, snap.now))
    .sort(
      (a, b) =>
        retrievability(snap.progress[a.id]!.srs!, snap.now) -
        retrievability(snap.progress[b.id]!.srs!, snap.now),
    )
    .slice(0, 8);
  const reviewMinutes = reviews.reduce((s, p) => s + Math.round(p.est * 0.4), 0);

  // 2. Fill the rest of the budget with the highest-value new work that fits.
  const remaining = Math.max(0, minutes - reviewMinutes);
  const candidates = recommend(snap, 26).map((r) => ({
    p: r.problem,
    value: Math.round(r.score * 1000),
    weight: Math.max(5, r.problem.est),
  }));
  const newWork = knapsack(candidates, Math.round(remaining * 0.85));

  // 3. One deliberate stretch problem, above the comfort zone.
  const stretch = PROBLEMS.filter(
    (p) => !isSolved(snap, p.id) && !newWork.includes(p) && readinessFor(snap, p) < 0.55 && p.freq >= 3,
  ).sort((a, b) => scoreProblem(snap, b) - scoreProblem(snap, a))[0];

  const used = reviewMinutes + newWork.reduce((s, p) => s + p.est, 0);
  return {
    reviews,
    newWork,
    stretch,
    minutes: used,
    reviewMinutes,
    fill: minutes ? Math.min(1, used / minutes) : 0,
  };
}

/* ============================================================
   Diagnostics
   ============================================================ */

export interface SkillGap {
  id: string;
  kind: "topic" | "pattern";
  name: string;
  mastery: number;
  seen: number;
  /** How much interview weight rides on this skill. */
  weight: number;
  /** mastery gap times weight: what to fix first. */
  priority: number;
}

export function weakestSkills(
  snap: LearnerSnapshot,
  entries: { id: string; name: string; kind: "topic" | "pattern"; weight: number }[],
  k = 5,
): SkillGap[] {
  return entries
    .map((e) => {
      const m = getMastery(snap, e.id);
      return {
        id: e.id,
        kind: e.kind,
        name: e.name,
        mastery: m.p,
        seen: m.seen,
        weight: e.weight,
        priority: (1 - m.p) * e.weight * (m.seen === 0 ? 0.75 : 1),
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, k);
}

/** Topics whose prerequisites are satisfied but which are not yet started. */
export function unlockedTopics(snap: LearnerSnapshot): TopicId[] {
  return TOPICS.filter((t) => {
    const own = getMastery(snap, t.id).p;
    if (own > 0.55) return false;
    return t.prereq.every((p) => getMastery(snap, p).p >= 0.45);
  }).map((t) => t.id);
}

/** Percentage of a sheet completed. */
export function sheetProgress(snap: LearnerSnapshot, tier: Tier) {
  const list = problemsInTier(tier);
  const solved = list.filter((p) => isSolved(snap, p.id)).length;
  return { solved, total: list.length, pct: list.length ? solved / list.length : 0 };
}
