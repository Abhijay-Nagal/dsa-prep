import type { Company, Difficulty, Problem } from "@/lib/types";
import { byCompany, PROBLEMS } from "@/lib/data/problems";
import { TOPIC_MAP } from "@/lib/data/topics";
import { expectedScore, problemRating } from "./mastery";
import { getMastery, type LearnerSnapshot } from "./recommender";

export interface ReadinessReport {
  score: number; // 0..100
  band: string;
  coverage: number; // fraction of the company's tagged problems solved
  topicScores: { topic: string; name: string; weight: number; mastery: number; solved: number; total: number }[];
  gaps: { topic: string; name: string; deficit: number }[];
  mixReadiness: Record<Difficulty, number>;
  ratingGap: number;
  verdict: string;
  daysToReady: number;
}

/** Rating we expect a candidate to be comfortable at for each company bucket. */
const TARGET_RATING: Record<string, number> = {
  faang: 1750,
  product: 1650,
  fintech: 1700,
  startup: 1700,
  core: 1600,
  service: 1300,
};

export function companyReadiness(
  snap: LearnerSnapshot,
  company: Company,
  solvedPerDay = 2,
): ReadinessReport {
  const tagged = companySheet(company);
  const solvedTagged = tagged.filter((p) => snap.progress[p.id]?.status === "solved");
  const coverage = tagged.length ? solvedTagged.length / tagged.length : 0;

  const focusEntries = Object.entries(company.focus) as [string, number][];
  const topicScores = focusEntries
    .map(([topic, weight]) => {
      const list = tagged.filter((p) => p.topic === topic);
      const solved = list.filter((p) => snap.progress[p.id]?.status === "solved").length;
      return {
        topic,
        name: TOPIC_MAP[topic]?.name ?? topic,
        weight,
        mastery: getMastery(snap, topic).p,
        solved,
        total: list.length,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const weightSum = topicScores.reduce((s, t) => s + t.weight, 0) || 1;
  // blend what they know (mastery) with what they have actually practised for this company
  const skill =
    topicScores.reduce((s, t) => {
      const practice = t.total ? Math.min(1, t.solved / Math.max(3, t.total * 0.55)) : t.mastery;
      return s + t.weight * (0.6 * t.mastery + 0.4 * practice);
    }, 0) / weightSum;

  const target = TARGET_RATING[company.bucket] ?? 1600;
  const ratingGap = target - snap.rating;
  const ratingComponent = Math.max(0, Math.min(1, expectedScore(snap.rating, target) * 1.25));

  const mixReadiness = (["Easy", "Medium", "Hard"] as Difficulty[]).reduce(
    (acc, d) => {
      const list = tagged.filter((p) => p.difficulty === d);
      const solved = list.filter((p) => snap.progress[p.id]?.status === "solved").length;
      acc[d] = list.length ? solved / list.length : 0;
      return acc;
    },
    {} as Record<Difficulty, number>,
  );

  // weight the difficulty mix the way the company actually interviews
  const mixScore =
    (mixReadiness.Easy * company.mix.easy +
      mixReadiness.Medium * company.mix.medium +
      mixReadiness.Hard * company.mix.hard) /
    100;

  const score = Math.round(
    100 * Math.max(0, Math.min(1, 0.4 * skill + 0.25 * ratingComponent + 0.2 * mixScore + 0.15 * coverage)),
  );

  const gaps = topicScores
    .map((t) => ({ topic: t.topic, name: t.name, deficit: t.weight * (1 - t.mastery) }))
    .sort((a, b) => b.deficit - a.deficit)
    .slice(0, 4);

  const remaining = tagged.filter((p) => snap.progress[p.id]?.status !== "solved").length;
  const needed = Math.max(0, Math.round(remaining * (1 - score / 140)));
  const daysToReady = solvedPerDay > 0 ? Math.ceil(needed / solvedPerDay) : 0;

  const band =
    score >= 85 ? "Interview ready" :
    score >= 70 ? "Nearly there" :
    score >= 50 ? "Building" :
    score >= 30 ? "Early" : "Just started";

  const verdict =
    score >= 85
      ? `You are tracking well above the ${company.name} bar. Switch to timed mock rounds.`
      : score >= 70
        ? `Close. Clear the gaps in ${gaps[0]?.name ?? "your weakest topic"} and start timed practice.`
        : score >= 50
          ? `Solid base. The biggest lever right now is ${gaps[0]?.name ?? "your weakest topic"}.`
          : `Early days. Work the ${company.name} sheet in order and let the planner pace you.`;

  return { score, band, coverage, topicScores, gaps, mixReadiness, ratingGap, verdict, daysToReady };
}

export interface SheetEntry {
  problem: Problem;
  /** true when this company is explicitly tagged on the problem, false when it was matched to their focus areas. */
  tagged: boolean;
}

const sheetOrder = (company: Company) => (a: Problem, b: Problem) => {
  const fa = (company.focus[a.topic] ?? 0.2) * a.freq + (a.must ? 2 : 0);
  const fb = (company.focus[b.topic] ?? 0.2) * b.freq + (b.must ? 2 : 0);
  if (fb !== fa) return fb - fa;
  return a.tier - b.tier || problemRating(a.difficulty, a.freq, a.tier) - problemRating(b.difficulty, b.freq, b.tier);
};

/**
 * A company's list: reported tags first, then problems matched to the topics
 * that company leans on, so every company page is usable without inventing tags.
 */
export function companyEntries(company: Company, minSize = 70): SheetEntry[] {
  const tagged = byCompany(company.id).slice().sort(sheetOrder(company));
  const taggedIds = new Set(tagged.map((p) => p.id));
  const entries: SheetEntry[] = tagged.map((problem) => ({ problem, tagged: true }));
  if (entries.length >= minSize) return entries;

  const derived = PROBLEMS.filter((p) => {
    if (taggedIds.has(p.id)) return false;
    const w = company.focus[p.topic] ?? 0;
    if (w < 0.45) return false;
    // service companies interview at a much lower difficulty ceiling
    if (company.bucket === "service" && p.difficulty === "Hard") return false;
    if (company.bucket === "service" && p.tier > 250) return false;
    return p.freq >= (company.bucket === "service" ? 2 : 3);
  })
    .sort(sheetOrder(company))
    .slice(0, minSize - entries.length);

  return [...entries, ...derived.map((problem) => ({ problem, tagged: false }))];
}

/** The company-specific sheet, ordered the way they ask them. */
export function companySheet(company: Company, limit?: number): Problem[] {
  const list = companyEntries(company).map((e) => e.problem);
  return limit ? list.slice(0, limit) : list;
}

/** Only the problems where this company is an explicitly reported tag. */
export const companyTagged = (company: Company): Problem[] =>
  byCompany(company.id).slice().sort(sheetOrder(company));

/** Named cuts of the company sheet, so "top 50" means something concrete. */
export function companyPhases(company: Company) {
  const all = companySheet(company);
  return [
    { id: "top-25", name: "Last 48 hours", size: 25, blurb: "If the interview is tomorrow, do only these." },
    { id: "top-50", name: "Top 50", size: 50, blurb: "The core set for this company." },
    { id: "top-100", name: "Top 100", size: 100, blurb: "Comfortable coverage of their question bank." },
    { id: "full", name: "Full list", size: all.length, blurb: "Everything on this company list." },
  ].filter((ph) => ph.size <= all.length || ph.id === "full");
}
