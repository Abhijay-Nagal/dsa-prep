import type { Problem } from "@/lib/types";
import { PROBLEMS } from "@/lib/data/problems";

/**
 * "Solved on LeetCode" is tracked separately from "solved here", because the
 * two mean different things: one is a problem you have already beaten and do
 * not want to repeat, the other is progress through a sheet.
 *
 * Keys are normalised titles. Normalising collapses a title, a LeetCode slug
 * and a full problem URL onto the same key ("Two Sum", "two-sum" and
 * ".../problems/two-sum/" all become "twosum"), so a pasted list can be in any
 * of those shapes and still match.
 *
 * Titles that are not in the bank are still stored. They keep the count honest,
 * and if such a problem is ever added to the bank it is marked automatically.
 */

/** Lowercase, drop everything that is not a letter or digit. */
export function lcKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    // a pasted URL: keep only the slug
    .replace(/^.*?\/problems\/([^/?#]+).*$/, "$1")
    // leading list numbering, e.g. "1. Two Sum" or "1) Two Sum"
    .replace(/^\d+\s*[.)\]-]\s*/, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Every key that marks this problem as done on LeetCode.
 *
 * Cached by problem id because this is called from a Zustand selector inside
 * every row of a 486-row list, which would otherwise re-allocate the array on
 * each store update.
 */
const keyCache = new Map<string, string[]>();

export function problemLcKeys(p: Problem): string[] {
  const hit = keyCache.get(p.id);
  if (hit) return hit;
  const keys = [lcKey(p.title)];
  if (p.links.lcSlug) keys.push(lcKey(p.links.lcSlug));
  const out = [...new Set(keys)];
  keyCache.set(p.id, out);
  return out;
}

/** Normalised key -> bank problem. Built once. */
export const PROBLEM_BY_LC_KEY: Record<string, Problem> = (() => {
  const map: Record<string, Problem> = {};
  for (const p of PROBLEMS) {
    for (const k of problemLcKeys(p)) {
      if (!map[k]) map[k] = p;
    }
  }
  return map;
})();

export const isLcSolved = (lcSolved: Record<string, true>, p: Problem): boolean =>
  problemLcKeys(p).some((k) => lcSolved[k]);

export interface LcImportReport {
  /** Normalised keys to store. */
  keys: string[];
  /** Pasted titles that matched a problem in the bank. */
  matched: { title: string; problem: Problem }[];
  /** Pasted titles with no problem in the bank. Still recorded. */
  unmatched: string[];
  /** Lines ignored, such as the "101-200" headers people paste by accident. */
  skipped: string[];
  /** Keys that were not already marked. */
  added: number;
}

/** A line that is only digits, dashes, dots or a plus is a section header. */
const isHeader = (line: string): boolean => /^[\d\s–—.+/-]+$/.test(line);

/**
 * Parses a pasted list. One problem per line; titles, slugs and URLs all work,
 * and leading numbering is stripped.
 */
export function parseLcList(text: string, existing: Record<string, true> = {}): LcImportReport {
  const matched: { title: string; problem: Problem }[] = [];
  const unmatched: string[] = [];
  const skipped: string[] = [];
  const keys = new Set<string>();

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isHeader(line)) {
      skipped.push(line);
      continue;
    }
    const key = lcKey(line);
    if (!key) {
      skipped.push(line);
      continue;
    }
    keys.add(key);
    const problem = PROBLEM_BY_LC_KEY[key];
    if (problem) matched.push({ title: line, problem });
    else unmatched.push(line);
  }

  const list = [...keys];
  return {
    keys: list,
    matched,
    unmatched,
    skipped,
    added: list.filter((k) => !existing[k]).length,
  };
}

/** How many bank problems the stored keys cover. */
export function lcCoverage(lcSolved: Record<string, true>): { inBank: number; total: number; keys: number } {
  let inBank = 0;
  for (const p of PROBLEMS) if (isLcSolved(lcSolved, p)) inBank++;
  return { inBank, total: PROBLEMS.length, keys: Object.keys(lcSolved).length };
}
