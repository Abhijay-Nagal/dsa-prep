# DSA Prep — working notes

Client-only Next.js 16 app. No backend, no env vars, no API routes. All state lives in one Zustand store
persisted to `localStorage` under `dsa-prep-v1`.

## Commands

```bash
npm run dev            # dev server
npm run build          # prerenders every dynamic route
npx tsc --noEmit       # typecheck
npx eslint .           # must stay at zero errors and zero warnings
```

## Rules this codebase follows

**Never read the clock or check hydration during render.** Both come from `useSyncExternalStore` in
`hooks/useNow.ts` (`useNow`, `useHydrated`, `useOnline`). `useNow` is bucketed to the minute and returns 0
before hydration, so memoised engine calls stay stable and the server HTML matches.

**Never call setState synchronously inside an effect.** Derive the value, put it in an event handler, or use
a keyed remount. `CodePad` and `NotesPanel` both split into an outer component and a keyed inner one instead
of syncing props into state.

**Dynamic routes are a server wrapper plus a client view.** `page.tsx` exports `generateStaticParams` and
`generateMetadata`; `view.tsx` is the `"use client"` component and reads params with `useParams`. This keeps
all 580+ routes statically prerendered, which is what makes the offline cache work.

**Problem ids are URLs.** An id must match its title. There is no redirect layer, so renaming an id breaks
saved progress for that problem.

**Colour comes from a palette, not a single accent.** `data-palette` on `<html>` selects a block in
`app/globals.css`; Nebula lives in `:root` so it is the no-JS default and the server HTML is already right. Two places
set the attribute: the pre-paint script in `app/layout.tsx` and the effect in `Shell`. `lib/data/palettes.ts` holds
preview swatches only, so its colours must be kept in sync with the CSS by hand. Nothing hardcodes a brand colour:
glows, selection, the body washes, the primary button shadow and the pulse ring all derive from `--accent` with
`color-mix`, which is what makes a palette apply everywhere rather than in half the UI. `--easy`, `--medium` and
`--hard` are deliberately identical in every palette, because they carry meaning.

**LeetCode progress is keyed by normalised title, not by problem id.** `lib/data/lc.ts` owns `lcKey`, which collapses a
title, a LeetCode slug and a full problem URL onto one key, so a pasted list parses in any of those shapes. Keys for
problems *outside* the bank are stored too: they keep the count honest and are matched automatically if that problem is
ever added. `problemLcKeys` is cached by problem id because it runs inside a Zustand selector in every row of a 486-row
list. Never fold this into `progress` — "beaten on LeetCode" and "done in this sheet" are deliberately different facts.

**`lib/engine/similar.ts` weights a shared pattern by how rare it is.** `unbounded-knapsack` covers four problems that
really are one idea; `divide-conquer` spans merge sort, counting inversions and Kadane, which are related only in the
abstract. So each shared pattern scores `8 + 22 * (1 - (count-1)/24)`, halved again when the two problems sit in
different topics. Without that damping, Maximum Subarray offers Sort List as practice. Candidates come only from the
bank, because those are the problems whose LeetCode ids have been checked — never invent one.

**Detail pages get back navigation from `components/ui/PageNav.tsx`.** Back uses `router.back()` when
`window.history.length > 1` and pushes the `fallback` otherwise, which is the cold-open case (a shared link, or a PWA
shortcut, where `router.back()` would leave the app). The named origin chip is a separate affordance fed by
`useOrigin(href, label)`, which list pages call to record themselves. Call `useOrigin` *before* any `notFound()` guard
and pass optional-chained values, or it becomes a conditional hook.

**The persisted state is an explicit allowlist.** `partialize` in the store names every key that reaches
`localStorage`. `origin`, `toasts` and `hydrated` are left out on purpose: a persisted origin would show a misleading
"back to Blind 75" chip in a fresh tab. Add new transient fields nowhere; add new durable fields to that list.

**Bar and Ring take a 0..1 fraction, not a percentage.** Both clamp with `Math.min(1, value)`, so passing `72` renders
as a full bar. Every caller passes a fraction.

**Date-seeded features must be pure functions of the date key.** `lib/engine/daily.ts` picks the daily challenge, the
weekly spotlight and the tip from a hash of `YYYY-MM-DD`, never from progress. If the pick depended on what you had
solved it would change the moment you solved it. Read the day through `useNow()` and `todayKey(new Date(now))`, and
render a placeholder while `now` is 0.

## Adding a problem

Append a `Raw` entry to the right file in `lib/data/problems/`. Short keys: `t` title, `d` difficulty as
E/M/H, `tier` the smallest sheet it belongs to, `p` comma separated pattern codes, `c` comma separated
company codes, `f` frequency 1-5, `m` must-do, `e` minutes, `a` one line approach, `T`/`S` complexity,
`h` bespoke hints, `v` variant ids, `top` a topic override when the entry sits in another topic's file.
Code tables are in `lib/data/problems/_build.ts`.

Tier counts are deliberate and cumulative: 75, 150, 250, 450, then the Vault. Adding to a lower tier changes
what every larger sheet contains, so keep the counts balanced.

## Adding a visualiser

Write a `VizAlgo` in a `lib/algo/*.ts` file and add it to `ALGOS` in `registry.ts`. `run(input)` returns
frames; each frame is `{ note, line, state, metrics }`. The `state` shape must match what the renderer for
that `kind` reads in `components/viz/renderers.tsx`. `runAlgo` falls back to the default input if a user
input throws, so `run` may assume nothing about its argument but must not hang: clamp sizes and guard loops.

`parseNums` matches numbers with a regex rather than splitting on separators. Splitting produces empty
tokens and `Number("")` is 0, which silently injects phantom zeroes.

## The global layer

`app/layout.tsx` mounts five always-on clients below `Shell`: `ToastHost`, `CommandPalette`, `Shortcuts`, `FocusTimer`
and `Onboarding`. They talk to each other with window events rather than shared state: `open-palette`,
`open-shortcuts` and `toggle-focus`. `Onboarding` renders only while `!onboarded`, and `FocusTimer` renders only once
`onboarded` is true, so the wizard is never competing with the dock.

`Shortcuts` owns every global key. It bails out when the event target is an input, textarea, select or contenteditable,
and when any modifier is held, so single-letter shortcuts cannot fire while someone is typing a note.

## Verifying data and visualisers

There is no test runner. To check everything, add a temporary `app/selftest/route.ts` with
`export const dynamic = "force-dynamic"`, loop over `ALGOS` running each with its default input plus hostile
inputs, and validate the bank for duplicate ids, unknown patterns, unknown companies, dangling variants and
missing external ids. Run it against `next dev` and delete it afterwards. Do not prerender it, since running
every visualiser at build time exhausts the build worker heap.

For `lib/data/lc.ts` and `lib/engine/similar.ts`, import `LC_SEED`, then assert: re-importing adds zero keys; the
title, slug, URL and numbered forms of one problem collapse to a single key; no suggestion is already marked as solved
on LeetCode; and no problem suggests itself. Print the suggestions for a handful of well-known problems and actually
read them — the scoring is a heuristic, and a bad neighbour is only visible by eye.

For `lib/engine/daily.ts`, loop 400+ consecutive dates and assert the weekday difficulty rota, that no two adjacent
days draw the same problem, that every pick resolves in `PROBLEM_MAP`, and that calling twice with the same key is
stable. For `app/roadmap/page.tsx`, assert every prerequisite sits in a strictly lower layer than its topic and that
the layers partition all 24 topics.

## The user guide

`docs/user-guide.html` is the source; `docs/DSA-Prep-User-Guide.pdf` is rendered from it with headless Chrome. Each
`<section class="page">` must stay under 1013px tall or it spills onto an extra page. `docs/README.md` has the render
command and the measuring snippet.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
