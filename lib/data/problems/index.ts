import type { Difficulty, Problem, Tier, TopicId } from "@/lib/types";
import { CORE_ARRAYS } from "./core-arrays";
import { STRINGS_SEARCH } from "./strings-search";
import { STRUCTURES } from "./structures";
import { TREES_GRAPHS } from "./trees-graphs";
import { DP_GREEDY } from "./dp-greedy";
import { RECURSION_MISC } from "./recursion-misc";

const ALL_RAW: Problem[] = [
  ...CORE_ARRAYS,
  ...STRINGS_SEARCH,
  ...STRUCTURES,
  ...TREES_GRAPHS,
  ...DP_GREEDY,
  ...RECURSION_MISC,
];

/** De-duplicated bank, sorted so tier 75 comes first and frequency breaks ties. */
export const PROBLEMS: Problem[] = (() => {
  const seen = new Set<string>();
  const out: Problem[] = [];
  for (const p of ALL_RAW) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out.sort((a, b) => a.tier - b.tier || b.freq - a.freq || a.title.localeCompare(b.title));
})();

export const PROBLEM_MAP: Record<string, Problem> = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));

export const problemById = (id: string): Problem | undefined => PROBLEM_MAP[id];

/** Problems belonging to a sheet tier (nested: 150 contains all of 75). */
export const problemsInTier = (tier: Tier): Problem[] => PROBLEMS.filter((p) => p.tier <= tier);

export const byTopic = (topic: TopicId): Problem[] => PROBLEMS.filter((p) => p.topic === topic);

export const byCompany = (companyId: string): Problem[] =>
  PROBLEMS.filter((p) => p.companies.includes(companyId));

export const byPattern = (patternId: string): Problem[] =>
  PROBLEMS.filter((p) => p.patterns.includes(patternId));

export const mustDo = (): Problem[] =>
  PROBLEMS.filter((p) => p.must).sort((a, b) => b.freq - a.freq || a.tier - b.tier);

export const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

export const TIER_COUNTS: Record<Tier, number> = {
  75: problemsInTier(75).length,
  150: problemsInTier(150).length,
  250: problemsInTier(250).length,
  450: problemsInTier(450).length,
  500: problemsInTier(500).length,
};

/* ------------------------------ external links ----------------------------- */

export interface PlatformLink {
  platform: string;
  url: string;
  /** true when the URL is a direct problem link, false when it is a search fallback. */
  exact: boolean;
  note?: string;
}

const q = (s: string) => encodeURIComponent(s);

/**
 * Every place a problem can be practised. Direct links where the identifier is
 * known, honest search links everywhere else.
 */
export function platformLinks(p: Problem): PlatformLink[] {
  const out: PlatformLink[] = [];
  if (p.links.lcSlug) {
    out.push({
      platform: "LeetCode",
      url: `https://leetcode.com/problems/${p.links.lcSlug}/`,
      exact: true,
      note: p.premium ? "Premium only" : p.links.lc ? `Problem ${p.links.lc}` : undefined,
    });
  } else {
    out.push({ platform: "LeetCode", url: `https://leetcode.com/problemset/?search=${q(p.title)}`, exact: false });
  }
  out.push(
    p.links.gfg
      ? { platform: "GeeksforGeeks", url: `https://www.geeksforgeeks.org/problems/${p.links.gfg}`, exact: true }
      : { platform: "GeeksforGeeks", url: `https://www.geeksforgeeks.org/search/?gq=${q(p.title)}`, exact: false },
  );
  out.push({ platform: "Code360", url: `https://www.naukri.com/code360/problems?search=${q(p.title)}`, exact: false });
  out.push({ platform: "InterviewBit", url: `https://www.interviewbit.com/search/?q=${q(p.title)}`, exact: false });
  out.push({ platform: "HackerRank", url: `https://www.hackerrank.com/search?q=${q(p.title)}`, exact: false });
  out.push({ platform: "CodeChef", url: `https://www.codechef.com/search?q=${q(p.title)}`, exact: false });
  out.push({ platform: "Editorial video", url: `https://www.youtube.com/results?search_query=${q(p.title + " explained dsa")}`, exact: false });
  return out;
}
