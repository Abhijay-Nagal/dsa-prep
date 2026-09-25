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

## Verifying data and visualisers

There is no test runner. To check everything, add a temporary `app/selftest/route.ts` with
`export const dynamic = "force-dynamic"`, loop over `ALGOS` running each with its default input plus hostile
inputs, and validate the bank for duplicate ids, unknown patterns, unknown companies, dangling variants and
missing external ids. Run it against `next dev` and delete it afterwards. Do not prerender it, since running
every visualiser at build time exhausts the build worker heap.
