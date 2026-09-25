"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AchievementInput, DayLog, Difficulty, Grade, MasteryState, ProblemProgress, SolveStatus, Tier,
} from "@/lib/types";
import { PROBLEM_MAP, PROBLEMS } from "@/lib/data/problems";
import { TOPICS } from "@/lib/data/topics";
import { PATTERNS } from "@/lib/data/patterns";
import { bktUpdate, emptyMastery, paramsForDifficulty, attemptScore, problemRating, updateRating, BASE_RATING } from "@/lib/engine/mastery";
import { emptyCard, review as srsReview } from "@/lib/engine/srs";
import { bumpStreak, emptyStreak, levelFromXp, settleStreak, todayKey, xpForSolve, type StreakState } from "@/lib/engine/xp";
import { newlyUnlocked } from "@/lib/engine/achievements";

export interface Settings {
  theme: "dark" | "light";
  accent: string;
  targetCompany?: string;
  activeSheet: string;
  activeTier: Tier;
  dailyMinutes: number;
  dailyProblems: number;
  reduceMotion: boolean;
  sound: boolean;
  language: "javascript" | "python" | "cpp" | "java";
  vizSpeed: number;
  showHintsFirst: boolean;
  name: string;
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
  kind: "xp" | "achievement" | "levelup" | "info" | "streak";
  icon?: string;
}

interface StoreState {
  hydrated: boolean;
  settings: Settings;
  progress: Record<string, ProblemProgress>;
  mastery: Record<string, MasteryState>;
  rating: number;
  ratingHistory: { t: number; r: number }[];
  xp: number;
  streak: StreakState;
  days: Record<string, DayLog>;
  achievements: string[];
  vizWatched: string[];
  arenaWins: number;
  bestQuiz: number;
  reviewCount: number;
  toasts: Toast[];
  lastSolvedId?: string;

  /* actions */
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  markStatus: (id: string, status: SolveStatus, opts?: { confidence?: number; seconds?: number; hints?: number }) => void;
  toggleStar: (id: string) => void;
  useHint: (id: string) => void;
  setNote: (id: string, note: string) => void;
  setCode: (id: string, lang: string, code: string) => void;
  gradeReview: (id: string, grade: Grade) => void;
  addStudyMinutes: (m: number) => void;
  watchViz: (slug: string) => void;
  recordArenaWin: () => void;
  recordQuiz: (scorePct: number) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  resetAll: () => void;
  importState: (json: string) => boolean;
  exportState: () => string;
  achievementInput: () => AchievementInput;
}

const emptyProgress = (): ProblemProgress => ({
  status: "todo",
  confidence: 0,
  attempts: 0,
  usedHints: 0,
});

const defaultSettings: Settings = {
  theme: "dark",
  accent: "#6d5efc",
  activeSheet: "blind-75",
  activeTier: 75,
  dailyMinutes: 90,
  dailyProblems: 3,
  reduceMotion: false,
  sound: true,
  language: "javascript",
  vizSpeed: 1,
  showHintsFirst: false,
  name: "",
};

const touchDay = (days: Record<string, DayLog>, patch: Partial<DayLog>): Record<string, DayLog> => {
  const key = todayKey();
  const prev = days[key] ?? { date: key, solved: 0, reviewed: 0, minutes: 0, xp: 0 };
  return {
    ...days,
    [key]: {
      date: key,
      solved: prev.solved + (patch.solved ?? 0),
      reviewed: prev.reviewed + (patch.reviewed ?? 0),
      minutes: prev.minutes + (patch.minutes ?? 0),
      xp: prev.xp + (patch.xp ?? 0),
    },
  };
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      settings: defaultSettings,
      progress: {},
      mastery: {},
      rating: BASE_RATING,
      ratingHistory: [],
      xp: 0,
      streak: emptyStreak(),
      days: {},
      achievements: [],
      vizWatched: [],
      arenaWins: 0,
      bestQuiz: 0,
      reviewCount: 0,
      toasts: [],

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      pushToast: (t) =>
        set((s) => ({ toasts: [...s.toasts, { ...t, id: Math.random().toString(36).slice(2) }].slice(-4) })),

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      markStatus: (id, status, opts = {}) => {
        const problem = PROBLEM_MAP[id];
        if (!problem) return;
        const state = get();
        const prev = state.progress[id] ?? emptyProgress();
        const wasSolved = prev.status === "solved";
        const now = Date.now();
        const hints = opts.hints ?? prev.usedHints;

        const next: ProblemProgress = {
          ...prev,
          status,
          attempts: prev.attempts + (status === "todo" ? 0 : 1),
          lastSeen: now,
          usedHints: hints,
          confidence: opts.confidence ?? prev.confidence,
          timeSpent: (prev.timeSpent ?? 0) + (opts.seconds ?? 0),
        };

        let xpGain = 0;
        let updates: Partial<StoreState> = {};

        if (status === "solved") {
          next.solvedAt = prev.solvedAt ?? now;
          next.srs = srsReview(prev.srs ?? emptyCard(now), hints > 1 ? 2 : 3, now);

          // knowledge tracing on every pattern plus the topic
          const params = paramsForDifficulty(problem.difficulty);
          const mastery = { ...state.mastery };
          for (const key of [...problem.patterns, problem.topic]) {
            mastery[key] = bktUpdate(mastery[key] ?? emptyMastery(), true, params);
          }

          // Elo
          const solvedCount = Object.values(state.progress).filter((p) => p.status === "solved").length;
          const score = attemptScore({
            solved: true,
            hints,
            overTime: (opts.seconds ?? 0) > problem.est * 60 * 1.5,
          });
          const rating = updateRating(
            state.rating,
            problemRating(problem.difficulty, problem.freq, problem.tier),
            score,
            solvedCount,
          );

          if (!wasSolved) {
            const streak = bumpStreak(settleStreak(state.streak));
            const gain = xpForSolve(problem, {
              hints,
              firstTry: prev.attempts === 0,
              streak: streak.current,
              underEstimate: (opts.seconds ?? 0) > 0 && (opts.seconds ?? 0) < problem.est * 60,
            });
            xpGain = gain.total;
            updates = {
              mastery,
              rating,
              ratingHistory: [...state.ratingHistory, { t: now, r: rating }].slice(-400),
              xp: state.xp + xpGain,
              streak,
              days: touchDay(state.days, { solved: 1, xp: xpGain, minutes: Math.round((opts.seconds ?? 0) / 60) }),
              lastSolvedId: id,
            };

            const beforeLevel = levelFromXp(state.xp).level;
            const afterLevel = levelFromXp(state.xp + xpGain).level;
            setTimeout(() => {
              get().pushToast({
                kind: "xp",
                title: `+${gain.total} XP`,
                body: gain.parts.map((p) => `${p.label} ${p.amount > 0 ? "+" : ""}${p.amount}`).join(" · "),
              });
              if (afterLevel > beforeLevel) {
                get().pushToast({ kind: "levelup", title: `Level ${afterLevel}`, body: "New level reached" });
              }
            }, 0);
          } else {
            updates = { mastery, rating };
          }
        } else if (status === "attempted") {
          const params = paramsForDifficulty(problem.difficulty);
          const mastery = { ...state.mastery };
          for (const key of [...problem.patterns, problem.topic]) {
            mastery[key] = bktUpdate(mastery[key] ?? emptyMastery(), false, params);
          }
          updates = { mastery };
        }

        set({ progress: { ...state.progress, [id]: next }, ...updates } as StoreState);

        // achievements
        const input = get().achievementInput();
        const unlocked = newlyUnlocked(input, get().achievements);
        if (unlocked.length) {
          set((s) => ({ achievements: [...s.achievements, ...unlocked.map((a) => a.id)] }));
          setTimeout(() => {
            for (const a of unlocked) {
              get().pushToast({ kind: "achievement", title: a.name, body: a.desc, icon: a.icon });
            }
          }, 350);
        }
      },

      toggleStar: (id) =>
        set((s) => {
          const prev = s.progress[id] ?? emptyProgress();
          return { progress: { ...s.progress, [id]: { ...prev, starred: !prev.starred } } };
        }),

      useHint: (id) =>
        set((s) => {
          const prev = s.progress[id] ?? emptyProgress();
          return { progress: { ...s.progress, [id]: { ...prev, usedHints: prev.usedHints + 1 } } };
        }),

      setNote: (id, note) =>
        set((s) => {
          const prev = s.progress[id] ?? emptyProgress();
          return { progress: { ...s.progress, [id]: { ...prev, notes: note } } };
        }),

      setCode: (id, lang, code) =>
        set((s) => {
          const prev = s.progress[id] ?? emptyProgress();
          return { progress: { ...s.progress, [id]: { ...prev, code: { ...(prev.code ?? {}), [lang]: code } } } };
        }),

      gradeReview: (id, grade) => {
        const problem = PROBLEM_MAP[id];
        const state = get();
        const prev = state.progress[id] ?? emptyProgress();
        const now = Date.now();
        const card = srsReview(prev.srs ?? emptyCard(now), grade, now);
        const mastery = { ...state.mastery };
        if (problem) {
          const params = paramsForDifficulty(problem.difficulty);
          for (const key of [...problem.patterns, problem.topic]) {
            mastery[key] = bktUpdate(mastery[key] ?? emptyMastery(), grade >= 3, params);
          }
        }
        const streak = bumpStreak(settleStreak(state.streak));
        const gain = problem
          ? xpForSolve(problem, { hints: 0, firstTry: false, streak: streak.current, underEstimate: false, review: true }).total
          : 10;

        set({
          progress: { ...state.progress, [id]: { ...prev, srs: card, lastSeen: now } },
          mastery,
          streak,
          xp: state.xp + gain,
          reviewCount: state.reviewCount + 1,
          days: touchDay(state.days, { reviewed: 1, xp: gain }),
        });
        get().pushToast({ kind: "xp", title: `+${gain} XP`, body: "Review logged" });
      },

      addStudyMinutes: (m) =>
        set((s) => ({ days: touchDay(s.days, { minutes: m }) })),

      watchViz: (slug) =>
        set((s) => (s.vizWatched.includes(slug) ? s : { vizWatched: [...s.vizWatched, slug] })),

      recordArenaWin: () => set((s) => ({ arenaWins: s.arenaWins + 1 })),

      recordQuiz: (scorePct) => set((s) => ({ bestQuiz: Math.max(s.bestQuiz, scorePct) })),

      resetAll: () =>
        set({
          progress: {}, mastery: {}, rating: BASE_RATING, ratingHistory: [], xp: 0,
          streak: emptyStreak(), days: {}, achievements: [], vizWatched: [],
          arenaWins: 0, bestQuiz: 0, reviewCount: 0, toasts: [],
        }),

      exportState: () => {
        const s = get();
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: s.settings, progress: s.progress, mastery: s.mastery, rating: s.rating,
            ratingHistory: s.ratingHistory, xp: s.xp, streak: s.streak, days: s.days,
            achievements: s.achievements, vizWatched: s.vizWatched, arenaWins: s.arenaWins,
            bestQuiz: s.bestQuiz, reviewCount: s.reviewCount,
          },
          null,
          2,
        );
      },

      importState: (json) => {
        try {
          const d = JSON.parse(json);
          if (!d || typeof d !== "object" || !d.progress) return false;
          set({
            settings: { ...defaultSettings, ...(d.settings ?? {}) },
            progress: d.progress ?? {},
            mastery: d.mastery ?? {},
            rating: d.rating ?? BASE_RATING,
            ratingHistory: d.ratingHistory ?? [],
            xp: d.xp ?? 0,
            streak: d.streak ?? emptyStreak(),
            days: d.days ?? {},
            achievements: d.achievements ?? [],
            vizWatched: d.vizWatched ?? [],
            arenaWins: d.arenaWins ?? 0,
            bestQuiz: d.bestQuiz ?? 0,
            reviewCount: d.reviewCount ?? 0,
          });
          return true;
        } catch {
          return false;
        }
      },

      achievementInput: () => {
        const s = get();
        const solved = Object.entries(s.progress).filter(([, p]) => p.status === "solved");
        const byDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
        const byTopic: Record<string, number> = {};
        let noHint = 0;
        for (const [id, p] of solved) {
          const prob = PROBLEM_MAP[id];
          if (!prob) continue;
          byDifficulty[prob.difficulty]++;
          byTopic[prob.topic] = (byTopic[prob.topic] ?? 0) + 1;
          if (p.usedHints === 0) noHint++;
        }
        const solvedIds = new Set(solved.map(([id]) => id));
        const blind = PROBLEMS.filter((p) => p.tier === 75);
        const days = Object.values(s.days);
        return {
          solvedCount: solved.length,
          byDifficulty,
          byTopic,
          streak: s.streak.current,
          bestStreak: s.streak.best,
          xp: s.xp,
          level: levelFromXp(s.xp).level,
          reviews: s.reviewCount,
          contestsWon: s.arenaWins,
          perfectDays: days.filter((d) => d.solved >= s.settings.dailyProblems).length,
          vizWatched: s.vizWatched.length,
          noHintSolves: noHint,
          companySheetsDone: blind.every((p) => solvedIds.has(p.id)) ? 1 : 0,
          totalMinutes: days.reduce((a, d) => a + d.minutes, 0),
          quizScore: s.bestQuiz,
        };
      },
    }),
    {
      name: "dsa-prep-v1",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          state.streak = settleStreak(state.streak);
        }
      },
    },
  ),
);

/* ---------------------------- derived selectors ---------------------------- */

export const useSolvedCount = () =>
  useStore((s) => Object.values(s.progress).filter((p) => p.status === "solved").length);

export const useProblemProgress = (id: string) => useStore((s) => s.progress[id]);

export const useLevel = () => useStore((s) => levelFromXp(s.xp));

export const ALL_SKILL_ENTRIES = [
  ...TOPICS.map((t) => ({ id: t.id, name: t.name, kind: "topic" as const, weight: t.interviewWeight })),
  ...PATTERNS.map((p) => ({ id: p.id, name: p.name, kind: "pattern" as const, weight: 0.6 })),
];
