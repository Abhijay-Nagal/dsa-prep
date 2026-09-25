import type { VizFrame } from "@/lib/types";

export const C = {
  idle: "#2b3550",
  compare: "#ffb020",
  swap: "#ff5f6d",
  done: "#2fd48f",
  active: "#6d5efc",
  window: "#34d3ff",
  ghost: "#1a2236",
  pivot: "#b15cff",
  path: "#2fd48f",
  visited: "#6d5efc",
  frontier: "#34d3ff",
  best: "#ffcc4d",
} as const;

export function parseNums(input: string, fallback: number[] = [5, 3, 8, 1, 9, 2]): number[] {
  // Match numbers directly. Splitting on separators produces empty tokens,
  // and Number("") is 0, which silently injects phantom zeroes into the input.
  const nums = (input.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
  return nums.length ? nums.slice(0, 40) : fallback;
}

export function parseWords(input: string, fallback: string[] = []): string[] {
  const parts = input.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts.slice(0, 30) : fallback;
}

/** "3 1 4 | 5" -> { left: [3,1,4], right: [5] } */
export function splitOnPipe(input: string): [string, string] {
  const i = input.indexOf("|");
  return i === -1 ? [input, ""] : [input.slice(0, i), input.slice(i + 1)];
}

export class Frames {
  private list: VizFrame[] = [];
  private counters: Record<string, number> = {};

  bump(key: string, by = 1) {
    this.counters[key] = (this.counters[key] ?? 0) + by;
    return this;
  }

  set(key: string, v: number) {
    this.counters[key] = v;
    return this;
  }

  push(note: string, state: Record<string, unknown>, line?: number | number[], extra?: Record<string, number | string>) {
    this.list.push({ note, state, line, metrics: { ...this.counters, ...(extra ?? {}) } });
    return this;
  }

  get all() {
    return this.list;
  }

  get count() {
    return this.counters;
  }
}

/** Colour map helper for array renderers. */
export const colorArray = (n: number, base: string = C.idle) => new Array(n).fill(base);

export const key = (r: number, c: number) => `${r},${c}`;

/** Lay nodes of a binary tree (heap-indexed array) onto x/y coordinates. */
export function heapLayout(size: number) {
  const depth = Math.floor(Math.log2(Math.max(1, size))) + 1;
  const pos: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const indexInLevel = i - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    pos.push({
      x: ((indexInLevel + 0.5) / nodesInLevel) * 100,
      y: depth > 1 ? (level / (depth - 1)) * 82 + 9 : 50,
    });
  }
  return pos;
}

/** Circular layout for graph nodes. */
export function circleLayout(n: number, cx = 50, cy = 50, r = 36) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

/** Parse "0-1,0-2,1-3" edge lists, optionally weighted "0-1:4". */
export function parseEdges(input: string): { u: number; v: number; w: number }[] {
  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((tok) => {
      const [pair, w] = tok.split(":");
      const [u, v] = pair.split("-").map((x) => parseInt(x, 10));
      return { u, v, w: w ? Number(w) : 1 };
    })
    .filter((e) => Number.isFinite(e.u) && Number.isFinite(e.v));
}

export const nodeCountFromEdges = (edges: { u: number; v: number }[]) =>
  edges.reduce((m, e) => Math.max(m, e.u, e.v), 0) + 1;
