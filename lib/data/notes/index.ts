import type { Problem } from "@/lib/types";
import type { NoteBook } from "./_types";
import { CORE_ARRAYS_NOTES } from "./core-arrays";
import { STRINGS_SEARCH_NOTES } from "./strings-search";
import { STRUCTURES_NOTES } from "./structures";
import { TREES_GRAPHS_NOTES } from "./trees-graphs";
import { DP_GREEDY_NOTES } from "./dp-greedy";
import { RECURSION_MISC_NOTES } from "./recursion-misc";

/**
 * Refresher notes, one per problem in the bank, keyed by problem id. The files
 * mirror lib/data/problems/ so a new problem's note goes next to it.
 */
export const NOTES: NoteBook = {
  ...CORE_ARRAYS_NOTES,
  ...STRINGS_SEARCH_NOTES,
  ...STRUCTURES_NOTES,
  ...TREES_GRAPHS_NOTES,
  ...DP_GREEDY_NOTES,
  ...RECURSION_MISC_NOTES,
};

export interface Refresher {
  idea: string;
  steps: string[];
  pitfall?: string;
  time?: string;
  space?: string;
}

/**
 * The note for a problem, merged with what the problem already says about
 * itself. The problem's own approach and complexity win, so the two never
 * disagree on the page.
 */
export function refresherFor(p: Problem): Refresher | null {
  const n = NOTES[p.id];
  if (!n) return null;
  const idea = n.k ?? p.approach;
  if (!idea) return null;
  return { idea, steps: n.s, pitfall: n.w, time: p.time ?? n.T, space: p.space ?? n.S };
}
