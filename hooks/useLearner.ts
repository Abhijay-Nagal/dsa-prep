"use client";

import { useMemo } from "react";
import { useStore, ALL_SKILL_ENTRIES } from "@/lib/store/useStore";
import type { LearnerSnapshot } from "@/lib/engine/recommender";
import { dailyPlan, recommend, sheetProgress, weakestSkills } from "@/lib/engine/recommender";
import { PROBLEMS, PROBLEM_MAP } from "@/lib/data/problems";
import { isDue, retrievability } from "@/lib/engine/srs";
import { SHEET_MAP } from "@/lib/data/sheets";
import { useHydrated, useNow } from "@/hooks/useNow";

/** Everything the engine needs, rebuilt whenever progress changes. */
export function useSnapshot(): LearnerSnapshot {
  const hydrated = useHydrated();
  const progress = useStore((s) => s.progress);
  const mastery = useStore((s) => s.mastery);
  const rating = useStore((s) => s.rating);
  const activeSheet = useStore((s) => s.settings.activeSheet);
  const targetCompany = useStore((s) => s.settings.targetCompany);
  const now = useNow();

  return useMemo(
    () => ({
      progress: hydrated ? progress : {},
      mastery: hydrated ? mastery : {},
      rating: hydrated ? rating : 1200,
      tier: SHEET_MAP[activeSheet]?.tier ?? 75,
      targetCompany,
      now,
    }),
    [hydrated, progress, mastery, rating, activeSheet, targetCompany, now],
  );
}

export function useRecommendations(n = 6) {
  const snap = useSnapshot();
  return useMemo(() => recommend(snap, n), [snap, n]);
}

export function useDailyPlan() {
  const snap = useSnapshot();
  const minutes = useStore((s) => s.settings.dailyMinutes);
  return useMemo(() => dailyPlan(snap, minutes), [snap, minutes]);
}

export function useDueReviews() {
  const progress = useStore((s) => s.progress);
  const hydrated = useHydrated();
  const now = useNow();
  return useMemo(() => {
    if (!hydrated || !now) return [];
    return Object.entries(progress)
      .filter(([, p]) => isDue(p.srs, now))
      .map(([id, p]) => ({ problem: PROBLEM_MAP[id], recall: retrievability(p.srs!, now), card: p.srs! }))
      .filter((x) => x.problem)
      .sort((a, b) => a.recall - b.recall);
  }, [progress, hydrated, now]);
}

export function useWeakSkills(k = 5) {
  const snap = useSnapshot();
  return useMemo(() => weakestSkills(snap, ALL_SKILL_ENTRIES, k), [snap, k]);
}

export function useSheetStats() {
  const snap = useSnapshot();
  return useMemo(
    () =>
      Object.values(SHEET_MAP).map((sheet) => ({
        sheet,
        ...sheetProgress(snap, sheet.tier),
      })),
    [snap],
  );
}

export function useTotals() {
  const progress = useStore((s) => s.progress);
  const hydrated = useHydrated();
  return useMemo(() => {
    const solved = hydrated ? Object.entries(progress).filter(([, p]) => p.status === "solved") : [];
    const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
    const byTopic: Record<string, number> = {};
    let minutes = 0;
    for (const [id, p] of solved) {
      const prob = PROBLEM_MAP[id];
      if (!prob) continue;
      byDiff[prob.difficulty]++;
      byTopic[prob.topic] = (byTopic[prob.topic] ?? 0) + 1;
      minutes += Math.round((p.timeSpent ?? 0) / 60);
    }
    const totals = { Easy: 0, Medium: 0, Hard: 0 };
    for (const p of PROBLEMS) totals[p.difficulty]++;
    return { solvedCount: solved.length, byDiff, byTopic, totals, minutes, total: PROBLEMS.length };
  }, [progress, hydrated]);
}
