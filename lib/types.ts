/* ============================================================
   Core domain types
   ============================================================ */

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Nested sheet tiers. A problem in tier 75 is also part of 150/250/450. */
export type Tier = 75 | 150 | 250 | 450 | 500;

export type TopicId =
  | "arrays" | "strings" | "hashing" | "sorting" | "binary-search"
  | "two-pointers" | "sliding-window" | "prefix-sum" | "matrix" | "intervals"
  | "linked-list" | "stack-queue" | "trees" | "bst" | "heap"
  | "graphs" | "greedy" | "dp" | "backtracking" | "tries"
  | "bit-manipulation" | "math" | "design" | "advanced";

export interface Topic {
  id: TopicId;
  name: string;
  icon: string;
  blurb: string;
  color: string;
  order: number;
  /** Topic ids that should be comfortable before this one. */
  prereq: TopicId[];
  keyIdeas: string[];
  interviewWeight: number; // 0..1 — how often it shows up in interviews
}

export interface Pattern {
  id: string;
  name: string;
  topic: TopicId;
  /** Signals in a problem statement that hint at this pattern. */
  triggers: string[];
  idea: string;
  template: string;
  complexity: string;
  /** Progressive hints, generic to the pattern. */
  hints: string[];
  viz?: string; // visualizer slug
}

export interface ExternalLinks {
  lc?: number;          // LeetCode problem number
  lcSlug?: string;      // LeetCode slug
  gfg?: string;         // GeeksforGeeks problem slug
  cn?: string;          // Coding Ninjas / Naukri Code360 slug
  cc?: string;          // CodeChef problem code
  hr?: string;          // HackerRank slug
  ib?: string;          // InterviewBit slug
  spoj?: string;        // SPOJ code
  cf?: string;          // Codeforces problem id
}

export interface Problem {
  id: string;
  title: string;
  topic: TopicId;
  difficulty: Difficulty;
  patterns: string[];
  companies: string[];
  tier: Tier;
  links: ExternalLinks;
  /** 1..5 — how frequently this shows up in real interviews. */
  freq: number;
  /** Flagged as a non-negotiable, must-solve problem. */
  must?: boolean;
  /** Estimated minutes to solve at first attempt. */
  est: number;
  premium?: boolean;
  hints?: string[];
  approach?: string;
  time?: string;
  space?: string;
  followUp?: string;
  /** Sibling problems that are variants of the same core idea. */
  variants?: string[];
}

export type CompanyBucket = "faang" | "product" | "fintech" | "service" | "startup" | "core";

export interface Company {
  id: string;
  name: string;
  short: string;
  bucket: CompanyBucket;
  color: string;
  /** Topics this company leans on, weighted 0..1. */
  focus: Partial<Record<TopicId, number>>;
  rounds: { name: string; detail: string }[];
  bar: string;        // what "good" looks like
  tips: string[];
  mix: { easy: number; medium: number; hard: number };
  /** Typical number of DSA rounds. */
  dsaRounds: number;
  hiringNote: string;
}

export interface Sheet {
  id: string;
  name: string;
  short: string;
  tier: Tier;
  blurb: string;
  origin: string;
  color: string;
  weeks: number;
  hoursPerDay: number;
}

/* ============================================================
   Progress + learner model
   ============================================================ */

export type SolveStatus = "todo" | "solved" | "attempted" | "revisit";

export interface ProblemProgress {
  status: SolveStatus;
  /** Self-reported confidence 0..5 after solving. */
  confidence: number;
  attempts: number;
  solvedAt?: number;
  lastSeen?: number;
  timeSpent?: number; // seconds
  usedHints: number;
  starred?: boolean;
  notes?: string;
  code?: Record<string, string>; // language -> source
  /** Spaced repetition scheduling state. */
  srs?: SrsCard;
}

export interface SrsCard {
  due: number;          // epoch ms
  stability: number;    // days
  difficulty: number;   // 1..10
  reps: number;
  lapses: number;
  lastReview: number;
  state: "new" | "learning" | "review" | "relearning";
}

export type Grade = 1 | 2 | 3 | 4; // again / hard / good / easy

export interface MasteryState {
  /** Bayesian Knowledge Tracing posterior P(skill known). */
  p: number;
  seen: number;
  correct: number;
  updated: number;
}

export interface DayLog {
  date: string;      // YYYY-MM-DD
  solved: number;
  reviewed: number;
  minutes: number;
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  secret?: boolean;
  /** Returns 0..1 progress toward unlock. */
  progress: (s: AchievementInput) => number;
}

export interface AchievementInput {
  solvedCount: number;
  byDifficulty: Record<Difficulty, number>;
  byTopic: Record<string, number>;
  streak: number;
  bestStreak: number;
  xp: number;
  level: number;
  reviews: number;
  contestsWon: number;
  perfectDays: number;
  vizWatched: number;
  noHintSolves: number;
  companySheetsDone: number;
  totalMinutes: number;
  quizScore: number;
  focusSessions: number;
  dailyChallenges: number;
  /** Derived from solve timestamps, which is why these are booleans not counts. */
  nightOwl: boolean;
  earlyBird: boolean;
  comeback: boolean;
}

/* ============================================================
   Visualizer engine
   ============================================================ */

export type VizKind =
  | "array" | "grid" | "graph" | "tree" | "linkedlist"
  | "stack" | "dptable" | "recursion" | "text" | "custom";

export interface VizFrame {
  /** Human explanation of what just happened. */
  note: string;
  /** Line indices of the pseudocode being executed. */
  line?: number | number[];
  /** Arbitrary payload interpreted by the renderer. */
  state: Record<string, unknown>;
  /** Counters shown in the metrics strip. */
  metrics?: Record<string, number | string>;
}

export interface VizAlgo {
  slug: string;
  name: string;
  topic: TopicId;
  kind: VizKind;
  blurb: string;
  complexity: { time: string; space: string; note?: string };
  pseudocode: string[];
  /** Default input, editable by the user. */
  defaultInput: string;
  inputHint: string;
  /** Builds the frame list for a given raw input string. */
  run: (input: string) => VizFrame[];
  related?: string[];   // problem ids
  difficulty: Difficulty;
  tags: string[];
}
