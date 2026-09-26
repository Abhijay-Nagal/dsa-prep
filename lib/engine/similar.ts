import type { Problem, ProblemProgress } from "@/lib/types";
import { PROBLEMS } from "@/lib/data/problems";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { TOPIC_MAP } from "@/lib/data/topics";
import { isLcSolved } from "@/lib/data/lc";

/**
 * "You solved that one, so you can solve these."
 *
 * The transferable unit is the *pattern*, not the topic: Two Sum and Group
 * Anagrams are both `hashing`, but only the first shares the complement trick.
 * So shared patterns dominate the score, an explicit variant outranks everything,
 * and difficulty is a penalty in both directions — a much harder problem is not
 * "you should be able to do this", and a much easier one teaches nothing.
 *
 * Candidates come only from the bank, because those are the problems whose
 * LeetCode ids have been checked. Nothing here is invented.
 */

const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 } as const;

/** How many problems carry each pattern. Built once. */
const PATTERN_COUNT: Record<string, number> = (() => {
  const c: Record<string, number> = {};
  for (const p of PROBLEMS) for (const pat of p.patterns) c[pat] = (c[pat] ?? 0) + 1;
  return c;
})();

/**
 * Not all shared patterns mean the same thing. `unbounded-knapsack` covers four
 * problems that really are the same idea; `divide-conquer` spans merge sort,
 * counting inversions and Kadane, which are only related in the abstract. So a
 * rare pattern counts for much more than a broad one, and a broad pattern shared
 * across two different topics is damped further — that is what stops "Sort List"
 * being offered as practice for Maximum Subarray.
 */
function patternWeight(pattern: string, sameTopic: boolean): number {
  const count = PATTERN_COUNT[pattern] ?? 1;
  const idf = 8 + 22 * (1 - Math.min(1, (count - 1) / 24));
  return sameTopic ? idf : idf * 0.55;
}

export interface SimilarHit {
  problem: Problem;
  score: number;
  /** Why it was picked, in the user's words. */
  reason: string;
  /** Pattern ids shared with the source problem. */
  shared: string[];
}

function reasonFor(src: Problem, cand: Problem, shared: string[], isVariant: boolean): string {
  if (isVariant) return "Direct variant of this problem";
  if (shared.length > 1) {
    return `Same ${shared.length} patterns: ${shared.map((s) => PATTERN_MAP[s]?.name ?? s).join(", ")}`;
  }
  if (shared.length === 1) {
    return `Same pattern: ${PATTERN_MAP[shared[0]]?.name ?? shared[0]}`;
  }
  return `Same topic: ${TOPIC_MAP[cand.topic]?.name ?? cand.topic}`;
}

export interface SimilarOptions {
  /** Problems already solved on LeetCode are excluded. */
  lcSolved?: Record<string, true>;
  /** Problems already solved in the app are excluded. */
  progress?: Record<string, ProblemProgress>;
  /** Also allow problems already solved here (default false). */
  includeSolvedHere?: boolean;
  limit?: number;
}

export function similarProblems(src: Problem, opts: SimilarOptions = {}): SimilarHit[] {
  const { lcSolved = {}, progress = {}, includeSolvedHere = false, limit = 5 } = opts;
  const srcPatterns = new Set(src.patterns);
  const variants = new Set(src.variants ?? []);
  const srcRank = DIFF_RANK[src.difficulty];

  const hits: SimilarHit[] = [];

  for (const cand of PROBLEMS) {
    if (cand.id === src.id) continue;
    if (isLcSolved(lcSolved, cand)) continue;
    if (!includeSolvedHere && progress[cand.id]?.status === "solved") continue;

    const shared = cand.patterns.filter((x) => srcPatterns.has(x));
    const isVariant = variants.has(cand.id) || (cand.variants ?? []).includes(src.id);
    const sameTopic = cand.topic === src.topic;

    // Needs at least one real link. Sharing only a topic is weak but allowed,
    // because some topics have very few patterns.
    if (!isVariant && shared.length === 0 && !sameTopic) continue;

    let score = 0;
    if (isVariant) score += 60;
    for (const pat of shared) score += patternWeight(pat, sameTopic);
    if (sameTopic) score += 14;

    const gap = DIFF_RANK[cand.difficulty] - srcRank;
    // A step up is the useful direction; two steps either way is not "similar".
    if (gap === 0) score += 10;
    else if (gap === 1) score += 6;
    else if (gap === -1) score += 2;
    else score -= 10;

    // Prefer problems actually worth the time.
    score += cand.freq * 2;
    if (cand.must) score += 4;
    // Prefer ones with a direct LeetCode link, since the point is to go solve it.
    if (cand.links.lc) score += 5;
    if (cand.premium) score -= 6;

    if (score <= 0) continue;
    hits.push({ problem: cand, score, reason: reasonFor(src, cand, shared, isVariant), shared });
  }

  hits.sort((a, b) => b.score - a.score || a.problem.title.localeCompare(b.problem.title));

  // Keep the set varied: at most two from any single pattern signature.
  const usedSignature = new Map<string, number>();
  const out: SimilarHit[] = [];
  for (const h of hits) {
    const sig = h.shared.slice().sort().join("|") || h.problem.topic;
    const n = usedSignature.get(sig) ?? 0;
    if (n >= 2) continue;
    usedSignature.set(sig, n + 1);
    out.push(h);
    if (out.length >= limit) break;
  }
  return out;
}
