import type { Difficulty, MasteryState } from "@/lib/types";

/* ============================================================
   Bayesian Knowledge Tracing
   ============================================================

   A two-state hidden Markov model per skill (pattern or topic):
   the learner either knows the skill or does not. Each attempt is a noisy
   observation, because a learner who knows the skill can still slip, and one
   who does not can still guess.

       P(L_1)      prior probability the skill is already known
       P(T)        probability of learning it on any given attempt
       P(S)        slip: knows it but gets it wrong
       P(G)        guess: does not know it but gets it right
   ============================================================ */

export interface BktParams {
  pInit: number;
  pTransit: number;
  pSlip: number;
  pGuess: number;
}

export const DEFAULT_BKT: BktParams = { pInit: 0.18, pTransit: 0.22, pSlip: 0.1, pGuess: 0.2 };

/** Harder problems carry more evidence: slipping is likelier, guessing less so. */
export function paramsForDifficulty(d: Difficulty): BktParams {
  if (d === "Easy") return { pInit: 0.28, pTransit: 0.3, pSlip: 0.06, pGuess: 0.3 };
  if (d === "Hard") return { pInit: 0.1, pTransit: 0.16, pSlip: 0.16, pGuess: 0.1 };
  return DEFAULT_BKT;
}

export const emptyMastery = (p = DEFAULT_BKT.pInit): MasteryState => ({
  p,
  seen: 0,
  correct: 0,
  updated: Date.now(),
});

/**
 * One BKT update.
 * @param correct whether the attempt succeeded (solved without giving up)
 */
export function bktUpdate(state: MasteryState, correct: boolean, params: BktParams = DEFAULT_BKT): MasteryState {
  const { pTransit, pSlip, pGuess } = params;
  const prior = state.p;

  // posterior P(knew it | observation)
  const posterior = correct
    ? (prior * (1 - pSlip)) / (prior * (1 - pSlip) + (1 - prior) * pGuess)
    : (prior * pSlip) / (prior * pSlip + (1 - prior) * (1 - pGuess));

  // then allow learning to happen during this attempt
  const p = posterior + (1 - posterior) * pTransit;

  return {
    p: Math.min(0.999, Math.max(0.001, p)),
    seen: state.seen + 1,
    correct: state.correct + (correct ? 1 : 0),
    updated: Date.now(),
  };
}

/** Probability the learner answers the next item of this skill correctly. */
export function predictCorrect(state: MasteryState, params: BktParams = DEFAULT_BKT): number {
  return state.p * (1 - params.pSlip) + (1 - state.p) * params.pGuess;
}

/** Mastery decays if a skill has not been touched in a long time. */
export function decayed(state: MasteryState, now = Date.now(), halfLifeDays = 45): MasteryState {
  const days = (now - state.updated) / 86_400_000;
  if (days < 7) return state;
  const factor = Math.pow(0.5, (days - 7) / halfLifeDays);
  const floor = 0.15;
  return { ...state, p: floor + (state.p - floor) * factor };
}

export const masteryLabel = (p: number) =>
  p >= 0.9 ? "Mastered" : p >= 0.75 ? "Strong" : p >= 0.5 ? "Developing" : p >= 0.3 ? "Shaky" : "New";

export const masteryColor = (p: number) =>
  p >= 0.9 ? "#2fd48f" : p >= 0.75 ? "#34d3ff" : p >= 0.5 ? "#ffb020" : p >= 0.3 ? "#ff8a3d" : "#ff5f6d";

/* ============================================================
   Elo rating
   ============================================================
   The learner and every problem carry a rating. Solving a problem rated above
   you moves your rating up a lot; failing one below you moves it down a lot.
   This gives a single number that can be compared against a target company bar.
   ============================================================ */

export const BASE_RATING = 1200;

export function problemRating(difficulty: Difficulty, freq: number, tier: number): number {
  const base = difficulty === "Easy" ? 1100 : difficulty === "Medium" ? 1500 : 1850;
  // rarely asked problems from deep tiers tend to be more obscure, not harder
  const tierAdj = tier >= 450 ? 60 : tier >= 250 ? 20 : 0;
  const freqAdj = (3 - freq) * 15;
  return base + tierAdj + freqAdj;
}

export const expectedScore = (userRating: number, itemRating: number) =>
  1 / (1 + Math.pow(10, (itemRating - userRating) / 400));

/** K shrinks as the learner settles, so early results move the needle more. */
const kFactor = (solved: number) => (solved < 20 ? 48 : solved < 60 ? 32 : solved < 150 ? 24 : 16);

export function updateRating(
  userRating: number,
  itemRating: number,
  score: number,
  solvedCount: number,
): number {
  const k = kFactor(solvedCount);
  const e = expectedScore(userRating, itemRating);
  return Math.round(userRating + k * (score - e));
}

/**
 * Score for an attempt, between 0 and 1.
 * Full credit for an unaided solve, partial credit when hints were used,
 * and a small floor for an honest attempt so trying never costs a full loss.
 */
export function attemptScore(opts: { solved: boolean; hints: number; overTime: boolean }): number {
  if (!opts.solved) return 0.15;
  let s = 1;
  s -= Math.min(0.45, opts.hints * 0.15);
  if (opts.overTime) s -= 0.15;
  return Math.max(0.3, s);
}

export const ratingBand = (r: number) =>
  r < 1150 ? "Beginner" :
  r < 1350 ? "Novice" :
  r < 1550 ? "Intermediate" :
  r < 1750 ? "Proficient" :
  r < 1950 ? "Advanced" :
  r < 2150 ? "Expert" : "Elite";
