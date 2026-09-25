import type { VizAlgo } from "@/lib/types";
import { C, Frames, parseNums } from "./util";

const arrState = (
  arr: number[],
  opts: {
    compare?: number[];
    swap?: number[];
    sorted?: number[];
    pivot?: number;
    range?: [number, number];
    pointers?: { name: string; index: number; color: string }[];
    shadow?: (number | null)[];
    shadowLabel?: string;
  } = {},
) => ({ arr: [...arr], ...opts });

export const bubbleSort: VizAlgo = {
  slug: "bubble-sort",
  name: "Bubble Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Easy",
  tags: ["comparison sort", "stable", "in place"],
  blurb:
    "Walk the array swapping any pair that is out of order. After pass k the k largest values have bubbled to the end.",
  complexity: { time: "O(n^2), best O(n) when already sorted", space: "O(1)", note: "Stable. Almost never the right answer, but the clearest place to see invariants." },
  pseudocode: [
    "for i from 0 to n-1:",
    "  swapped = false",
    "  for j from 0 to n-i-2:",
    "    if a[j] > a[j+1]:",
    "      swap(a[j], a[j+1]); swapped = true",
    "  if not swapped: break",
  ],
  defaultInput: "5, 1, 4, 2, 8, 0, 2",
  inputHint: "Comma separated numbers",
  related: ["sort-colors", "sort-an-array"],
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    const n = a.length;
    const sorted: number[] = [];
    f.set("comparisons", 0).set("swaps", 0);
    f.push("Starting array. Nothing is known to be in place yet.", arrState(a), 0);
    for (let i = 0; i < n; i++) {
      let swapped = false;
      f.push(`Pass ${i + 1}. The largest unsorted value will end up at index ${n - i - 1}.`, arrState(a, { sorted: [...sorted] }), 1);
      for (let j = 0; j < n - i - 1; j++) {
        f.bump("comparisons");
        f.push(`Compare a[${j}] = ${a[j]} with a[${j + 1}] = ${a[j + 1]}.`, arrState(a, { compare: [j, j + 1], sorted: [...sorted] }), 3);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
          f.bump("swaps");
          f.push(`Out of order, so swap them.`, arrState(a, { swap: [j, j + 1], sorted: [...sorted] }), 4);
        }
      }
      sorted.unshift(n - i - 1);
      f.push(`Index ${n - i - 1} is now final.`, arrState(a, { sorted: [...sorted] }), 5);
      if (!swapped) {
        for (let k = 0; k < n - i - 1; k++) sorted.unshift(k);
        f.push("A full pass with no swaps means the array is already sorted. Stop early.", arrState(a, { sorted: [...sorted] }), 5);
        break;
      }
    }
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 5);
    return f.all;
  },
};

export const selectionSort: VizAlgo = {
  slug: "selection-sort",
  name: "Selection Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Easy",
  tags: ["comparison sort", "in place", "unstable"],
  blurb: "Repeatedly find the smallest remaining value and swap it into the next position. Always n squared comparisons, but at most n swaps.",
  complexity: { time: "O(n^2) always", space: "O(1)", note: "Minimal number of writes, which matters when writes are expensive." },
  pseudocode: [
    "for i from 0 to n-1:",
    "  minIdx = i",
    "  for j from i+1 to n-1:",
    "    if a[j] < a[minIdx]: minIdx = j",
    "  swap(a[i], a[minIdx])",
  ],
  defaultInput: "64, 25, 12, 22, 11",
  inputHint: "Comma separated numbers",
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    const n = a.length;
    const sorted: number[] = [];
    f.set("comparisons", 0).set("swaps", 0);
    f.push("Find the minimum of the unsorted suffix, then place it.", arrState(a), 0);
    for (let i = 0; i < n; i++) {
      let min = i;
      f.push(`Assume a[${i}] = ${a[i]} is the smallest remaining.`, arrState(a, { sorted: [...sorted], pointers: [{ name: "min", index: min, color: C.best }] }), 1);
      for (let j = i + 1; j < n; j++) {
        f.bump("comparisons");
        f.push(`Is a[${j}] = ${a[j]} smaller than a[${min}] = ${a[min]}?`, arrState(a, { compare: [j, min], sorted: [...sorted], pointers: [{ name: "min", index: min, color: C.best }] }), 3);
        if (a[j] < a[min]) {
          min = j;
          f.push(`Yes. New minimum at index ${j}.`, arrState(a, { sorted: [...sorted], pointers: [{ name: "min", index: min, color: C.best }] }), 3);
        }
      }
      if (min !== i) {
        [a[i], a[min]] = [a[min], a[i]];
        f.bump("swaps");
      }
      sorted.push(i);
      f.push(`Place ${a[i]} at index ${i}.`, arrState(a, { swap: [i, min], sorted: [...sorted] }), 4);
    }
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 4);
    return f.all;
  },
};

export const insertionSort: VizAlgo = {
  slug: "insertion-sort",
  name: "Insertion Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Easy",
  tags: ["comparison sort", "stable", "adaptive"],
  blurb: "Grow a sorted prefix by lifting each new element out and shifting bigger values right until it drops into place.",
  complexity: { time: "O(n^2), O(n) on nearly sorted input", space: "O(1)", note: "The fastest simple sort on small or nearly sorted arrays, which is why real sorts fall back to it." },
  pseudocode: [
    "for i from 1 to n-1:",
    "  key = a[i]; j = i - 1",
    "  while j >= 0 and a[j] > key:",
    "    a[j+1] = a[j]; j--",
    "  a[j+1] = key",
  ],
  defaultInput: "12, 11, 13, 5, 6",
  inputHint: "Comma separated numbers",
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    f.set("comparisons", 0).set("shifts", 0);
    f.push("The first element is a sorted prefix of length one.", arrState(a, { sorted: [0] }), 0);
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      const sorted = Array.from({ length: i }, (_, k) => k);
      f.push(`Lift out a[${i}] = ${key} and find where it belongs.`, arrState(a, { sorted, pointers: [{ name: "key", index: i, color: C.pivot }] }), 1);
      while (j >= 0 && a[j] > key) {
        f.bump("comparisons").bump("shifts");
        a[j + 1] = a[j];
        f.push(`${a[j]} is bigger than ${key}, shift it right.`, arrState(a, { compare: [j, j + 1], sorted, pointers: [{ name: "j", index: j, color: C.compare }] }), 3);
        j--;
      }
      a[j + 1] = key;
      f.push(`Drop ${key} into index ${j + 1}. Prefix of length ${i + 1} is sorted.`, arrState(a, { sorted: Array.from({ length: i + 1 }, (_, k) => k) }), 4);
    }
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 4);
    return f.all;
  },
};

export const mergeSort: VizAlgo = {
  slug: "merge-sort",
  name: "Merge Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Medium",
  tags: ["divide and conquer", "stable", "O(n log n)"],
  blurb: "Split the array in half, sort each half recursively, then merge the two sorted runs in linear time.",
  complexity: { time: "O(n log n) always", space: "O(n)", note: "Stable, predictable, and the basis for counting inversions and external sorting." },
  pseudocode: [
    "sort(lo, hi):",
    "  if lo >= hi: return",
    "  mid = (lo + hi) / 2",
    "  sort(lo, mid); sort(mid+1, hi)",
    "  merge(lo, mid, hi)",
    "merge: walk both halves, always taking the smaller front",
  ],
  defaultInput: "38, 27, 43, 3, 9, 82, 10",
  inputHint: "Comma separated numbers",
  related: ["sort-list", "count-inversions", "merge-sorted-array"],
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    f.set("merges", 0).set("writes", 0);
    f.push("Divide until every piece has one element, then merge upward.", arrState(a), 0);

    const sort = (lo: number, hi: number, depth: number) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      f.push(`Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}].`, arrState(a, { range: [lo, hi], pointers: [{ name: "mid", index: mid, color: C.pivot }] }), 2, { depth });
      sort(lo, mid, depth + 1);
      sort(mid + 1, hi, depth + 1);

      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      f.bump("merges");
      f.push(`Merge the sorted halves [${left.join(", ")}] and [${right.join(", ")}].`, arrState(a, { range: [lo, hi] }), 4, { depth });
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          a[k] = left[i++];
        } else {
          a[k] = right[j++];
        }
        f.bump("writes");
        f.push(`Take ${a[k]} into position ${k}.`, arrState(a, { range: [lo, hi], compare: [k] }), 5);
        k++;
      }
      while (i < left.length) { a[k] = left[i++]; f.bump("writes"); f.push(`Drain ${a[k]} from the left half.`, arrState(a, { range: [lo, hi], compare: [k] }), 5); k++; }
      while (j < right.length) { a[k] = right[j++]; f.bump("writes"); f.push(`Drain ${a[k]} from the right half.`, arrState(a, { range: [lo, hi], compare: [k] }), 5); k++; }
      f.push(`[${lo}..${hi}] is now sorted.`, arrState(a, { range: [lo, hi], sorted: Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) }), 5);
    };

    sort(0, a.length - 1, 0);
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 5);
    return f.all;
  },
};

export const quickSort: VizAlgo = {
  slug: "quick-sort",
  name: "Quick Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Medium",
  tags: ["divide and conquer", "in place", "unstable"],
  blurb: "Pick a pivot, partition everything smaller to its left and larger to its right, then recurse on both sides.",
  complexity: { time: "O(n log n) average, O(n^2) worst", space: "O(log n) stack", note: "Fastest in practice because it sorts in place with excellent cache behaviour. Randomise the pivot to dodge the worst case." },
  pseudocode: [
    "quick(lo, hi):",
    "  if lo >= hi: return",
    "  p = partition(lo, hi)",
    "  quick(lo, p-1); quick(p+1, hi)",
    "partition: pivot = a[hi]; i = lo",
    "  for j in lo..hi-1: if a[j] < pivot: swap(a[i++], a[j])",
    "  swap(a[i], a[hi]); return i",
  ],
  defaultInput: "10, 80, 30, 90, 40, 50, 70",
  inputHint: "Comma separated numbers",
  related: ["kth-largest-element-in-an-array", "sort-colors"],
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    const done: number[] = [];
    f.set("comparisons", 0).set("swaps", 0);
    f.push("Partition around a pivot, then recurse into both sides.", arrState(a), 0);

    const partition = (lo: number, hi: number) => {
      const pivot = a[hi];
      f.push(`Pivot is a[${hi}] = ${pivot}. Everything smaller goes left of it.`, arrState(a, { range: [lo, hi], pivot: hi, sorted: [...done] }), 4);
      let i = lo;
      for (let j = lo; j < hi; j++) {
        f.bump("comparisons");
        f.push(`Is a[${j}] = ${a[j]} below the pivot ${pivot}?`, arrState(a, { range: [lo, hi], pivot: hi, compare: [j], sorted: [...done], pointers: [{ name: "i", index: i, color: C.active }] }), 5);
        if (a[j] < pivot) {
          if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; f.bump("swaps"); }
          f.push(`Yes, move it into the smaller region.`, arrState(a, { range: [lo, hi], pivot: hi, swap: [i, j], sorted: [...done] }), 5);
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      f.bump("swaps");
      done.push(i);
      f.push(`Swap the pivot into index ${i}. That index is now final.`, arrState(a, { range: [lo, hi], swap: [i, hi], sorted: [...done] }), 6);
      return i;
    };

    const quick = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) { done.push(lo); f.push(`Single element at ${lo} is trivially placed.`, arrState(a, { sorted: [...done] }), 1); return; }
      const p = partition(lo, hi);
      quick(lo, p - 1);
      quick(p + 1, hi);
    };

    quick(0, a.length - 1);
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 3);
    return f.all;
  },
};

export const heapSort: VizAlgo = {
  slug: "heap-sort",
  name: "Heap Sort",
  topic: "heap",
  kind: "array",
  difficulty: "Medium",
  tags: ["heap", "in place", "O(n log n)"],
  blurb: "Build a max heap in place, then repeatedly swap the root to the end and sift the new root down.",
  complexity: { time: "O(n log n)", space: "O(1)", note: "The only comparison sort that is both in place and guaranteed n log n." },
  pseudocode: [
    "build max heap: for i from n/2-1 down to 0: siftDown(i)",
    "for end from n-1 down to 1:",
    "  swap(a[0], a[end])",
    "  siftDown(0, end)",
    "siftDown(i, size): move a[i] down while a child is larger",
  ],
  defaultInput: "4, 10, 3, 5, 1, 8",
  inputHint: "Comma separated numbers",
  related: ["kth-largest-element-in-an-array", "implement-heap"],
  run(input) {
    const a = parseNums(input);
    const f = new Frames();
    const n = a.length;
    const sorted: number[] = [];
    f.set("comparisons", 0).set("swaps", 0);
    f.push("Read the array as a complete binary tree: children of i sit at 2i+1 and 2i+2.", arrState(a), 0);

    const siftDown = (i: number, size: number) => {
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let big = i;
        if (l < size) { f.bump("comparisons"); if (a[l] > a[big]) big = l; }
        if (r < size) { f.bump("comparisons"); if (a[r] > a[big]) big = r; }
        f.push(`Compare node ${i} with its children.`, arrState(a, { compare: [i, l, r].filter((x) => x < size), sorted: [...sorted] }), 4);
        if (big === i) break;
        [a[i], a[big]] = [a[big], a[i]];
        f.bump("swaps");
        f.push(`A child was larger, so sink the value.`, arrState(a, { swap: [i, big], sorted: [...sorted] }), 4);
        i = big;
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
    f.push("Heap property holds everywhere. The maximum is at the root.", arrState(a), 0);
    for (let end = n - 1; end > 0; end--) {
      [a[0], a[end]] = [a[end], a[0]];
      f.bump("swaps");
      sorted.unshift(end);
      f.push(`Move the maximum ${a[end]} to index ${end}, which is now final.`, arrState(a, { swap: [0, end], sorted: [...sorted] }), 2);
      siftDown(0, end);
    }
    f.push("Sorted.", arrState(a, { sorted: a.map((_, i) => i) }), 3);
    return f.all;
  },
};

export const countingSort: VizAlgo = {
  slug: "counting-sort",
  name: "Counting Sort",
  topic: "sorting",
  kind: "array",
  difficulty: "Medium",
  tags: ["non comparison", "stable", "linear"],
  blurb: "Tally how many times each key appears, turn the tally into positions with a prefix sum, then place elements from the back to stay stable.",
  complexity: { time: "O(n + k)", space: "O(n + k)", note: "Beats the n log n bound because it never compares two elements. Needs a small integer key range." },
  pseudocode: [
    "count[v]++ for each v",
    "prefix sum over count",
    "for i from n-1 down to 0:",
    "  out[--count[a[i]]] = a[i]",
  ],
  defaultInput: "4, 2, 2, 8, 3, 3, 1",
  inputHint: "Small non-negative integers",
  related: ["sort-colors", "count-sort-implementation"],
  run(input) {
    const a = parseNums(input).map((x) => Math.max(0, Math.round(x))).slice(0, 20);
    const f = new Frames();
    const max = Math.max(...a, 0);
    const count = new Array(max + 1).fill(0);
    f.push("Start with an empty tally for every possible key.", { arr: [...a], shadow: [...count], shadowLabel: "count" }, 0);
    for (let i = 0; i < a.length; i++) {
      count[a[i]]++;
      f.push(`Saw ${a[i]}, so bump count[${a[i]}].`, { arr: [...a], compare: [i], shadow: [...count], shadowLabel: "count", shadowHighlight: [a[i]] }, 0);
    }
    for (let v = 1; v <= max; v++) {
      count[v] += count[v - 1];
      f.push(`Prefix sum: count[${v}] now means how many values are at most ${v}.`, { arr: [...a], shadow: [...count], shadowLabel: "count", shadowHighlight: [v] }, 1);
    }
    const out = new Array(a.length).fill(null);
    for (let i = a.length - 1; i >= 0; i--) {
      count[a[i]]--;
      out[count[a[i]]] = a[i];
      f.push(`Place ${a[i]} at index ${count[a[i]]}. Walking backwards is what keeps equal keys in their original order.`, { arr: [...out], compare: [count[a[i]]], shadow: [...count], shadowLabel: "count", source: [...a], sourceCursor: i }, 3);
    }
    f.push("Sorted, with no comparison ever performed.", { arr: out, sorted: out.map((_, i) => i) }, 3);
    return f.all;
  },
};

export const SORTING_ALGOS = [bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, countingSort];
