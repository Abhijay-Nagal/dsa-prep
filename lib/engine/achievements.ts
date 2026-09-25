import type { Achievement, AchievementInput } from "@/lib/types";

const pct = (v: number, target: number) => Math.max(0, Math.min(1, v / target));

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-blood", name: "First Blood", desc: "Solve your first problem", icon: "Swords", tier: "bronze", progress: (s) => pct(s.solvedCount, 1) },
  { id: "ten-down", name: "Getting Warm", desc: "Solve 10 problems", icon: "Flame", tier: "bronze", progress: (s) => pct(s.solvedCount, 10) },
  { id: "fifty-down", name: "Half Century", desc: "Solve 50 problems", icon: "Target", tier: "silver", progress: (s) => pct(s.solvedCount, 50) },
  { id: "century", name: "Century", desc: "Solve 100 problems", icon: "Award", tier: "silver", progress: (s) => pct(s.solvedCount, 100) },
  { id: "blind-75-done", name: "Blind 75 Cleared", desc: "Finish every problem in Blind 75", icon: "ShieldCheck", tier: "gold", progress: (s) => pct(s.companySheetsDone, 1) },
  { id: "two-fifty", name: "Double Century", desc: "Solve 250 problems", icon: "Trophy", tier: "gold", progress: (s) => pct(s.solvedCount, 250) },
  { id: "four-fifty", name: "The Whole Syllabus", desc: "Solve 450 problems", icon: "Crown", tier: "platinum", progress: (s) => pct(s.solvedCount, 450) },

  { id: "streak-3", name: "Habit Forming", desc: "3 day streak", icon: "Flame", tier: "bronze", progress: (s) => pct(s.streak, 3) },
  { id: "streak-7", name: "One Week Strong", desc: "7 day streak", icon: "Flame", tier: "bronze", progress: (s) => pct(s.streak, 7) },
  { id: "streak-30", name: "Month of Grind", desc: "30 day streak", icon: "CalendarCheck", tier: "gold", progress: (s) => pct(s.streak, 30) },
  { id: "streak-100", name: "Unbreakable", desc: "100 day streak", icon: "Infinity", tier: "platinum", progress: (s) => pct(s.streak, 100) },

  { id: "hard-1", name: "Into the Deep", desc: "Solve your first Hard", icon: "Mountain", tier: "bronze", progress: (s) => pct(s.byDifficulty.Hard, 1) },
  { id: "hard-25", name: "Hard Mode", desc: "Solve 25 Hard problems", icon: "Mountain", tier: "gold", progress: (s) => pct(s.byDifficulty.Hard, 25) },
  { id: "hard-60", name: "No Fear", desc: "Solve 60 Hard problems", icon: "Skull", tier: "platinum", progress: (s) => pct(s.byDifficulty.Hard, 60) },
  { id: "medium-100", name: "Medium Machine", desc: "Solve 100 Medium problems", icon: "Gauge", tier: "gold", progress: (s) => pct(s.byDifficulty.Medium, 100) },

  { id: "no-hints-25", name: "Unassisted", desc: "Solve 25 problems without hints", icon: "EyeOff", tier: "silver", progress: (s) => pct(s.noHintSolves, 25) },
  { id: "no-hints-100", name: "Pure Signal", desc: "Solve 100 problems without hints", icon: "Sparkle", tier: "platinum", progress: (s) => pct(s.noHintSolves, 100) },

  { id: "reviewer-50", name: "Spaced Out", desc: "Complete 50 spaced repetition reviews", icon: "RefreshCw", tier: "silver", progress: (s) => pct(s.reviews, 50) },
  { id: "reviewer-250", name: "Long Term Memory", desc: "Complete 250 reviews", icon: "Brain", tier: "gold", progress: (s) => pct(s.reviews, 250) },

  { id: "topic-explorer", name: "Explorer", desc: "Solve at least one problem in 12 topics", icon: "Compass", tier: "silver", progress: (s) => pct(Object.values(s.byTopic).filter((v) => v > 0).length, 12) },
  { id: "topic-complete", name: "Full Spectrum", desc: "Solve at least one problem in every topic", icon: "Globe", tier: "gold", progress: (s) => pct(Object.values(s.byTopic).filter((v) => v > 0).length, 24) },

  { id: "level-10", name: "Double Digits", desc: "Reach level 10", icon: "TrendingUp", tier: "silver", progress: (s) => pct(s.level, 10) },
  { id: "level-25", name: "Seasoned", desc: "Reach level 25", icon: "Star", tier: "gold", progress: (s) => pct(s.level, 25) },
  { id: "level-40", name: "Veteran", desc: "Reach level 40", icon: "Gem", tier: "platinum", progress: (s) => pct(s.level, 40) },

  { id: "viz-10", name: "Visual Learner", desc: "Watch 10 algorithm visualisations", icon: "Eye", tier: "bronze", progress: (s) => pct(s.vizWatched, 10) },
  { id: "viz-all", name: "Seen It All", desc: "Watch 30 visualisations", icon: "Projector", tier: "gold", progress: (s) => pct(s.vizWatched, 30) },

  { id: "perfect-week", name: "Perfect Week", desc: "Hit your daily goal 7 days running", icon: "CheckCheck", tier: "silver", progress: (s) => pct(s.perfectDays, 7) },
  { id: "perfect-month", name: "Relentless", desc: "Hit your daily goal 30 times", icon: "Medal", tier: "gold", progress: (s) => pct(s.perfectDays, 30) },

  { id: "arena-5", name: "Contender", desc: "Win 5 arena rounds", icon: "Gamepad2", tier: "bronze", progress: (s) => pct(s.contestsWon, 5) },
  { id: "arena-25", name: "Arena Regular", desc: "Win 25 arena rounds", icon: "Joystick", tier: "gold", progress: (s) => pct(s.contestsWon, 25) },
  { id: "quiz-master", name: "Complexity Master", desc: "Score 90% or better on a complexity quiz", icon: "BadgeCheck", tier: "silver", progress: (s) => pct(s.quizScore, 90) },

  { id: "ten-hours", name: "Ten Hours In", desc: "Log 10 hours of practice", icon: "Clock", tier: "bronze", progress: (s) => pct(s.totalMinutes, 600) },
  { id: "hundred-hours", name: "Hundred Hour Club", desc: "Log 100 hours of practice", icon: "Hourglass", tier: "platinum", progress: (s) => pct(s.totalMinutes, 6000) },

  { id: "xp-5000", name: "Five Thousand", desc: "Earn 5,000 XP", icon: "Zap", tier: "silver", progress: (s) => pct(s.xp, 5000) },
  { id: "xp-25000", name: "Twenty Five K", desc: "Earn 25,000 XP", icon: "Bolt", tier: "gold", progress: (s) => pct(s.xp, 25000) },

  { id: "night-owl", name: "Night Owl", desc: "Solve a problem after midnight", icon: "Moon", tier: "bronze", secret: true, progress: () => 0 },
  { id: "early-bird", name: "Early Bird", desc: "Solve a problem before 6am", icon: "Sunrise", tier: "bronze", secret: true, progress: () => 0 },
  { id: "comeback", name: "Comeback", desc: "Return after a broken streak and rebuild to 7 days", icon: "Undo2", tier: "silver", secret: true, progress: () => 0 },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const TIER_COLOR: Record<Achievement["tier"], string> = {
  bronze: "#cd7f32",
  silver: "#c0c7d4",
  gold: "#ffcc4d",
  platinum: "#8ce7ff",
};

/** Achievements newly satisfied by this input, given the ones already earned. */
export function newlyUnlocked(input: AchievementInput, earned: string[]): Achievement[] {
  const set = new Set(earned);
  return ACHIEVEMENTS.filter((a) => !set.has(a.id) && a.progress(input) >= 1);
}
