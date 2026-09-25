# DSA Prep — Interview OS

An offline-capable DSA interview trainer. Nested problem sheets, company-specific lists, 46 animated
algorithm visualisers, spaced repetition, and a planner that sizes each day to the time you actually have.

Everything runs client side. No account, no backend, no network needed after the first load.

---

## What is in it

| | |
|---|---|
| Problems | 486, each tagged with topic, patterns, companies, interview frequency, target time and where to find it on other platforms |
| Sheets | 5 strictly nested phases: Blind 75 → Top 150 → SDE 250 → DSA 450 → the Vault |
| Companies | 42 profiles with round structure, what their bar is, difficulty mix and a readiness score |
| Visualisers | 46 step-by-step animations with narration, pseudocode tracing and editable input |
| Topics | 24, ordered by prerequisite so nothing uses an idea you have not met |
| Patterns | 48, each with trigger phrases, a template and a hint ladder |

### Nested phases

The sheets are supersets of each other, so a problem solved in Blind 75 is already solved in DSA 450 and
shows a "done in 75" badge there. Moving up a phase never asks you to redo anything.

```
Vault (486)
└── DSA 450 (450)
    └── SDE 250 (250)
        └── Top 150 (150)
            └── Blind 75 (75)
```

### Where else to practise each problem

Every problem page links out to LeetCode, GeeksforGeeks, Code360, InterviewBit, HackerRank, CodeChef and a
video search. Links are marked as direct when the exact problem id is known and as a search otherwise, so
you always know which is which.

---

## The learning engine

Four models run on your solve history. None of them need a server.

**Spaced repetition** (`lib/engine/srs.ts`)
A scheduler in the FSRS family. Each solved problem carries a memory *stability* and a *difficulty*, and the
next interval is solved from the forgetting curve `R(t) = (1 + 19t/81S)^-0.5` so the problem returns when your
predicted recall drops to 90%.

**Bayesian knowledge tracing** (`lib/engine/mastery.ts`)
A two-state hidden Markov model per topic and per pattern. Slip and guess probabilities vary by difficulty, so
a Hard solve is stronger evidence than an Easy one. Untouched skills decay.

**Elo rating** (`lib/engine/mastery.ts`)
You and every problem carry a rating. K shrinks as your history grows. Company readiness compares your rating
against a target bar per company tier.

**Adaptive planner** (`lib/engine/recommender.ts`)
Scores every unsolved problem on the zone of proximal development, a gaussian peaked where you have roughly a
70% chance of solving it, then adjusts for interview frequency, your active phase, your target company and
prerequisite readiness. The daily plan puts due reviews first, then fills the remaining minutes with a 0/1
knapsack over problem estimates, and adds one deliberate stretch problem.

---

## Visualisers

Each visualiser is a pure function from an input string to a list of frames. A frame carries a narration
line, the pseudocode line being executed, a state payload and live counters. The player can step, scrub,
replay and run at seven speeds, and every algorithm accepts your own input.

Renderers cover arrays and bars, grids, graphs, trees, linked lists, DP tables, recursion trees and string
matching. Adding an algorithm means writing one `run()` function and registering it.

Covered: bubble, selection, insertion, merge, quick, heap and counting sort, binary search and binary search
on the answer, two pointers, sliding window and window maximum, Kadane, prefix sums, monotonic stack, cyclic
sort, quickselect, list reversal, Floyd cycle detection, list merging, tree traversals, level order, BST
operations, BST validation, heap push and pop, BFS, DFS, Dijkstra, topological sort, union-find, Kruskal,
flood fill, memoisation versus brute force, knapsack, LCS, coin change, LIS, grid DP, edit distance,
N-Queens, subsets, permutations, Sudoku, KMP, tries and the sieve.

---

## Gamification

XP with per-solve breakdowns, 24 level titles, streaks with freezes that absorb one missed day, 40
achievements across four tiers, an activity heatmap, a mastery radar, and three arena modes: timed mock
rounds drawn from a company's difficulty mix, a pattern recognition sprint, and a complexity reading drill.

---

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, prerenders all 580+ routes
npm start
```

Requires Node 20 or newer.

### Stack

Next.js 16 with the App Router, React 19, TypeScript in strict mode, Tailwind CSS 4, Zustand with
localStorage persistence, Motion for animation, CodeMirror 6 for the scratchpad. Every dynamic route is
statically prerendered at build time so the whole app is cacheable and works offline.

### Project layout

```
app/                    routes; dynamic routes pair a server page.tsx with a client view.tsx
components/
  layout/               shell, command palette, toasts, PWA boot
  ui/                   design primitives: rings, bars, chips, modals, sparklines
  viz/                  the frame player and every renderer
  problems/             list, row, hints, notes, scratchpad
  dashboard/            streak, level, heatmap, radar, recommendation cards
lib/
  data/                 problems, topics, patterns, companies, sheets, quizzes
  algo/                 visualiser frame generators
  engine/               srs, mastery, recommender, readiness, xp, achievements
  store/                zustand store, the single source of progress
hooks/                  learner snapshot, clock and hydration stores
public/                 manifest, icons, service worker
```

---

## Offline and installable

A hand-written service worker precaches the shell, serves hashed build assets cache-first and falls back to
the cached shell for navigations. The manifest declares four shortcuts (today's plan, review queue,
visualisers, Blind 75). The install prompt appears once and remembers a dismissal.

All progress lives in `localStorage` under `dsa-prep-v1`, and the profile page exports and imports it as
JSON so you can move between devices.

---

## Deploying

The app is a standard Next.js project with no server-side dependencies or environment variables.

```bash
# Vercel
npx vercel           # preview
npx vercel --prod    # production
```

Or push to GitHub and import the repository at vercel.com/new. No configuration needed.

---

## Honesty about the data

Problem metadata is curated, not scraped. Interview frequency is a judgement call on a five point scale.
Company tags are reported tags where those are known; each company page also fills its list with problems
matched to that company's focus topics, and the page states how many of each it is showing. Round structures
and difficulty mixes reflect publicly reported processes and will drift over time.
