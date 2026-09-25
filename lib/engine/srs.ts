import type { Grade, SrsCard } from "@/lib/types";

/**
 * A compact free-spaced-repetition scheduler in the FSRS family.
 *
 * Each card carries a memory *stability* (how many days until recall probability
 * decays to the target) and a *difficulty* (1..10, how much this item resists
 * being learned). Reviews update both, and the next interval is solved directly
 * from the forgetting curve rather than from a fixed ladder of multipliers.
 *
 * Forgetting curve:  R(t) = (1 + FACTOR * t / S) ^ DECAY
 */

const DECAY = -0.5;
const FACTOR = 19 / 81;
/** Target recall probability at review time. 0.9 is the standard default. */
export const DEFAULT_RETENTION = 0.9;

const W = [
  0.4872, 1.4003, 3.7145, 13.8206, // initial stability per grade
  5.1618, 1.2298, 0.8975, 0.031, // difficulty terms
  1.6474, 0.1367, 1.0461, 2.1072, // stability growth
  0.0793, 0.3246, 1.587, 0.2272, 2.8755, // lapse + easy/hard bonuses
];

const clampD = (d: number) => Math.min(10, Math.max(1, d));

export function emptyCard(now = Date.now()): SrsCard {
  return { due: now, stability: 0, difficulty: 5, reps: 0, lapses: 0, lastReview: 0, state: "new" };
}

/** Days elapsed since the last review. */
const elapsedDays = (card: SrsCard, now: number) =>
  card.lastReview ? Math.max(0, (now - card.lastReview) / 86_400_000) : 0;

/** Probability the learner still remembers this item right now. */
export function retrievability(card: SrsCard, now = Date.now()): number {
  if (card.state === "new" || card.stability <= 0) return 0;
  const t = elapsedDays(card, now);
  return Math.pow(1 + (FACTOR * t) / card.stability, DECAY);
}

/** Interval, in days, that lands on the requested retention. */
function intervalFor(stability: number, retention = DEFAULT_RETENTION): number {
  const days = (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
  return Math.max(1, Math.round(days));
}

function initialStability(grade: Grade): number {
  return Math.max(0.1, W[grade - 1]);
}

function initialDifficulty(grade: Grade): number {
  return clampD(W[4] - Math.exp(W[5] * (grade - 1)) + 1);
}

function nextDifficulty(d: number, grade: Grade): number {
  const delta = -W[6] * (grade - 3);
  const damped = d + delta * ((10 - d) / 9);
  // pull gently back toward the "easy" anchor so difficulty does not drift forever
  return clampD(W[7] * initialDifficulty(4) + (1 - W[7]) * damped);
}

function stabilityAfterRecall(d: number, s: number, r: number, grade: Grade): number {
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus = grade === 4 ? W[16] : 1;
  const growth =
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus;
  return s * (1 + growth);
}

function stabilityAfterLapse(d: number, s: number, r: number): number {
  return Math.min(
    s,
    W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)),
  );
}

/**
 * Apply a review outcome.
 * @param grade 1 again, 2 hard, 3 good, 4 easy
 */
export function review(card: SrsCard, grade: Grade, now = Date.now(), retention = DEFAULT_RETENTION): SrsCard {
  if (card.state === "new" || card.stability <= 0) {
    const stability = initialStability(grade);
    const difficulty = initialDifficulty(grade);
    return {
      stability,
      difficulty,
      reps: 1,
      lapses: grade === 1 ? 1 : 0,
      lastReview: now,
      state: grade === 1 ? "learning" : "review",
      due: now + intervalFor(stability, retention) * 86_400_000,
    };
  }

  const r = retrievability(card, now);
  const difficulty = nextDifficulty(card.difficulty, grade);
  const stability =
    grade === 1
      ? stabilityAfterLapse(difficulty, card.stability, r)
      : stabilityAfterRecall(difficulty, card.stability, r, grade);

  return {
    stability,
    difficulty,
    reps: card.reps + 1,
    lapses: card.lapses + (grade === 1 ? 1 : 0),
    lastReview: now,
    state: grade === 1 ? "relearning" : "review",
    due: now + intervalFor(stability, retention) * 86_400_000,
  };
}

/** Human-readable preview of what each button will do, for the review UI. */
export function schedulePreview(card: SrsCard, now = Date.now()): Record<Grade, string> {
  const fmt = (ms: number) => {
    const days = (ms - now) / 86_400_000;
    if (days < 1) return "today";
    if (days < 2) return "1 day";
    if (days < 30) return `${Math.round(days)} days`;
    if (days < 365) return `${(days / 30).toFixed(1)} months`;
    return `${(days / 365).toFixed(1)} years`;
  };
  return {
    1: fmt(review(card, 1, now).due),
    2: fmt(review(card, 2, now).due),
    3: fmt(review(card, 3, now).due),
    4: fmt(review(card, 4, now).due),
  };
}

export const isDue = (card: SrsCard | undefined, now = Date.now()) => !!card && card.due <= now;

/** Cards sorted by urgency: most-forgotten first. */
export function dueQueue<T extends { srs?: SrsCard }>(items: T[], now = Date.now()): T[] {
  return items
    .filter((i) => isDue(i.srs, now))
    .sort((a, b) => retrievability(a.srs!, now) - retrievability(b.srs!, now));
}
