import type { Difficulty, Problem, Tier, TopicId } from "@/lib/types";

/**
 * Compact authoring format for the problem bank.
 * Short keys keep 450 entries readable; `expand` turns them into full Problems.
 */
export interface Raw {
  /** stable slug id */
  id: string;
  /** display title */
  t: string;
  /** E | M | H */
  d: "E" | "M" | "H";
  /** smallest sheet tier this problem belongs to (sheets are nested supersets) */
  tier: Tier;
  /** comma separated pattern short codes */
  p: string;
  /** comma separated company short codes */
  c: string;
  /** LeetCode problem number, when it exists there */
  lc?: number;
  /** LeetCode slug override (defaults to the kebab-cased title) */
  slug?: string;
  /** GeeksforGeeks practice slug, when known */
  gfg?: string;
  /** interview frequency, 1..5 */
  f?: number;
  /** flagged as a non-negotiable must-solve */
  m?: boolean;
  /** estimated minutes */
  e?: number;
  /** LeetCode premium only */
  prem?: boolean;
  /** one line approach summary */
  a?: string;
  /** time complexity */
  T?: string;
  /** space complexity */
  S?: string;
  /** follow-up asked in interviews */
  fu?: string;
  /** bespoke hint ladder, overrides the pattern hints */
  h?: string[];
  /** ids of sibling variants */
  v?: string[];
  /** topic override when a problem sits in a file of another topic */
  top?: TopicId;
}

const DIFF: Record<string, Difficulty> = { E: "Easy", M: "Medium", H: "Hard" };

/** pattern short code -> pattern id */
export const PAT: Record<string, string> = {
  ts: "two-sum-hash", tp: "two-pointers-opposite", fs: "fast-slow",
  swf: "sliding-window-fixed", swv: "sliding-window-variable", ps: "prefix-sum",
  kd: "kadane", bs: "binary-search-sorted", ba: "binary-search-answer",
  cs: "cyclic-sort", rev: "in-place-reversal", mi: "merge-intervals", sl: "sweep-line",
  mst: "monotonic-stack", mdq: "monotonic-deque", tk: "top-k-heap", th: "two-heaps",
  sub: "subsets-backtracking", perm: "permutations", gbt: "grid-backtracking",
  tdfs: "tree-dfs", tbfs: "tree-bfs", bstp: "bst-property",
  gbfs: "graph-bfs", gdfs: "graph-dfs", topo: "topological-sort", uf: "union-find",
  dij: "dijkstra", mstree: "mst",
  dp1: "dp-1d", kn: "knapsack", ukn: "unbounded-knapsack", lcs: "lcs-dp", lis: "lis-dp",
  grid: "dp-grid", idp: "interval-dp", bmk: "bitmask-dp", stk: "dp-stocks",
  trie: "trie-prefix", bit: "bit-tricks", kmp: "string-matching", gr: "greedy-exchange",
  mat: "matrix-manip", dsn: "design-ds", dc: "divide-conquer", qs: "quickselect",
  nt: "math-number-theory", seg: "segment-tree",
};

/** company short code -> company id */
export const CO: Record<string, string> = {
  go: "google", am: "amazon", ms: "microsoft", me: "meta", ap: "apple", nf: "netflix",
  ad: "adobe", ub: "uber", at: "atlassian", bb: "bloomberg", li: "linkedin", sf: "salesforce",
  or: "oracle", gs: "goldman-sachs", nv: "nvidia", fk: "flipkart", sw: "swiggy", zo: "zomato",
  pt: "paytm", rp: "razorpay", tc: "tcs", inf: "infosys", wi: "wipro", ac: "accenture",
  cg: "cognizant", cp: "capgemini", ibm: "ibm", sa: "samsung", qc: "qualcomm", de: "de-shaw",
  jp: "jpmorgan", wm: "walmart", pp: "phonepe", zh: "zoho", it: "intuit", sn: "servicenow",
  sp: "sprinklr", cr: "cred", mn: "media-net", tt: "tiktok", st: "stripe", ab: "airbnb",
};

export const kebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const split = (s: string | undefined, map: Record<string, string>) =>
  (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => map[x] ?? x);

export function expand(raw: Raw[], topic: TopicId): Problem[] {
  return raw.map((r) => ({
    id: r.id,
    title: r.t,
    topic: r.top ?? topic,
    difficulty: DIFF[r.d],
    patterns: split(r.p, PAT),
    companies: split(r.c, CO),
    tier: r.tier,
    links: { lc: r.lc, lcSlug: r.lc ? (r.slug ?? kebab(r.t)) : undefined, gfg: r.gfg },
    freq: r.f ?? 3,
    must: r.m,
    est: r.e ?? (r.d === "E" ? 15 : r.d === "M" ? 30 : 45),
    premium: r.prem,
    hints: r.h,
    approach: r.a,
    time: r.T,
    space: r.S,
    followUp: r.fu,
    variants: r.v,
  }));
}
