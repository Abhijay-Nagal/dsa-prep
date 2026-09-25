import type { Sheet, Tier } from "@/lib/types";

/**
 * The sheets are strictly nested. Everything in Blind 75 is also in Top 150,
 * which is inside SDE 250, inside DSA 450, inside the Vault. That is what makes
 * "you already solved this in an earlier phase" work without any bookkeeping.
 */
export const SHEETS: Sheet[] = [
  {
    id: "blind-75", name: "Blind 75", short: "75", tier: 75, color: "#2fd48f", weeks: 5, hoursPerDay: 2,
    blurb: "The smallest set that still covers every core pattern. If you only have a month, this is the month.",
    origin: "The list a Facebook engineer posted on Blind in 2020, still the highest signal per problem of any sheet.",
  },
  {
    id: "top-150", name: "Top 150", short: "150", tier: 150, color: "#34d3ff", weeks: 9, hoursPerDay: 2,
    blurb: "Blind 75 plus the 75 problems interviewers reach for when they want a second question.",
    origin: "Modelled on the NeetCode 150 and the LeetCode interview crash course, with the first 75 already inside.",
  },
  {
    id: "sde-250", name: "SDE 250", short: "250", tier: 250, color: "#ffb020", weeks: 14, hoursPerDay: 2.5,
    blurb: "Adds the classics that Indian product-company interviews lean on, plus implementation-heavy staples.",
    origin: "Built around the Striver SDE sheet lineage and the problems that repeat across Flipkart, Walmart and Samsung loops.",
  },
  {
    id: "dsa-450", name: "DSA 450", short: "450", tier: 450, color: "#b15cff", weeks: 24, hoursPerDay: 3,
    blurb: "Full syllabus coverage. Every topic, every pattern, enough repetition that recall becomes automatic.",
    origin: "In the spirit of the 450 DSA sheet: breadth first, so no topic can surprise you in a live round.",
  },
  {
    id: "vault", name: "The Vault", short: "All", tier: 500, color: "#ff5f6d", weeks: 30, hoursPerDay: 3,
    blurb: "Everything in the bank, including the advanced and rarely-asked material. For competitive rounds and long runways.",
    origin: "Segment trees, string matching, SCC and the harder DP families that sit beyond a standard SDE loop.",
  },
];

export const SHEET_MAP: Record<string, Sheet> = Object.fromEntries(SHEETS.map((s) => [s.id, s]));

export const sheetForTier = (t: Tier) => SHEETS.find((s) => s.tier === t);

/** Phase progression: which sheet comes after this one. */
export const nextSheet = (id: string): Sheet | undefined => {
  const i = SHEETS.findIndex((s) => s.id === id);
  return i >= 0 ? SHEETS[i + 1] : undefined;
};

export const prevSheet = (id: string): Sheet | undefined => {
  const i = SHEETS.findIndex((s) => s.id === id);
  return i > 0 ? SHEETS[i - 1] : undefined;
};
