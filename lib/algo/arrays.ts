import type { VizAlgo } from "@/lib/types";
import { C, Frames, parseNums, splitOnPipe } from "./util";

export const binarySearch: VizAlgo = {
  slug: "binary-search",
  name: "Binary Search",
  topic: "binary-search",
  kind: "array",
  difficulty: "Easy",
  tags: ["divide and conquer", "logarithmic"],
  blurb: "Halve the search space each step by comparing the target to the midpoint of a sorted range.",
  complexity: { time: "O(log n)", space: "O(1)", note: "Thirty-ish steps cover a billion elements. The bugs all live in the lo, hi and mid updates." },
  pseudocode: [
    "lo = 0; hi = n - 1",
    "while lo <= hi:",
    "  mid = lo + (hi - lo) / 2",
    "  if a[mid] == target: return mid",
    "  if a[mid] < target: lo = mid + 1",
    "  else: hi = mid - 1",
    "return -1",
  ],
  defaultInput: "1, 3, 5, 7, 9, 11, 13, 15, 17 | 13",
  inputHint: "sorted numbers | target",
  related: ["binary-search", "search-insert-position", "find-first-and-last-position"],
  run(input) {
    const [arrPart, targetPart] = splitOnPipe(input);
    const a = parseNums(arrPart).sort((x, y) => x - y);
    const target = parseNums(targetPart, [a[Math.floor(a.length / 2)]])[0];
    const f = new Frames();
    let lo = 0, hi = a.length - 1;
    f.set("steps", 0);
    f.push(`Looking for ${target} in a sorted array of ${a.length} values.`, { arr: a, range: [lo, hi], target }, 0);
    while (lo <= hi) {
      const mid = lo + ((hi - lo) >> 1);
      f.bump("steps");
      f.push(`Range is [${lo}..${hi}], so mid is ${mid} holding ${a[mid]}.`, { arr: a, range: [lo, hi], compare: [mid], target, pointers: [{ name: "lo", index: lo, color: C.active }, { name: "hi", index: hi, color: C.compare }, { name: "mid", index: mid, color: C.pivot }] }, 2);
      if (a[mid] === target) {
        f.push(`Found ${target} at index ${mid}, after ${f.count.steps} steps.`, { arr: a, sorted: [mid], target, range: [lo, hi] }, 3);
        return f.all;
      }
      if (a[mid] < target) {
        f.push(`${a[mid]} is below ${target}, so everything at or left of mid is out.`, { arr: a, range: [mid + 1, hi], discarded: [lo, mid], target }, 4);
        lo = mid + 1;
      } else {
        f.push(`${a[mid]} is above ${target}, so everything at or right of mid is out.`, { arr: a, range: [lo, mid - 1], discarded: [mid, hi], target }, 5);
        hi = mid - 1;
      }
    }
    f.push(`Range is empty, so ${target} is not present. It would belong at index ${lo}.`, { arr: a, target, pointers: [{ name: "insert", index: lo, color: C.compare }] }, 6);
    return f.all;
  },
};

export const binarySearchAnswer: VizAlgo = {
  slug: "binary-search-answer",
  name: "Binary Search on the Answer",
  topic: "binary-search",
  kind: "array",
  difficulty: "Medium",
  tags: ["monotonic predicate", "feasibility check"],
  blurb:
    "Koko eating bananas. The array is not sorted, but feasibility is monotonic in the eating speed, so binary search the speed instead of the array.",
  complexity: { time: "O(n log maxPile)", space: "O(1)", note: "The pattern behind minimise the maximum and maximise the minimum problems." },
  pseudocode: [
    "lo = 1; hi = max(piles)",
    "while lo < hi:",
    "  mid = (lo + hi) / 2",
    "  if hoursNeeded(mid) <= H: hi = mid",
    "  else: lo = mid + 1",
    "return lo",
  ],
  defaultInput: "30, 11, 23, 4, 20 | 6",
  inputHint: "pile sizes | hours available",
  related: ["koko-eating-bananas", "capacity-to-ship-packages", "split-array-largest-sum", "aggressive-cows"],
  run(input) {
    const [pilePart, hPart] = splitOnPipe(input);
    const piles = parseNums(pilePart, [30, 11, 23, 4, 20]).map((x) => Math.max(1, Math.round(x)));
    const H = Math.max(piles.length, parseNums(hPart, [6])[0]);
    const f = new Frames();
    let lo = 1, hi = Math.max(...piles);
    const hours = (k: number) => piles.reduce((s, p) => s + Math.ceil(p / k), 0);
    f.set("checks", 0);
    f.push(`Piles: ${piles.join(", ")}. You have ${H} hours. Find the slowest speed that still finishes.`, { arr: piles, candidate: null, lo, hi }, 0);
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1);
      const need = hours(mid);
      f.bump("checks");
      f.push(`Try speed ${mid}. That needs ${need} hours.`, { arr: piles, candidate: mid, lo, hi, perPile: piles.map((p) => Math.ceil(p / mid)), need, H }, 3, { speed: mid, hours: need });
      if (need <= H) {
        f.push(`${need} hours fits in ${H}, so ${mid} works. Nothing faster than ${mid} needs checking.`, { arr: piles, candidate: mid, lo, hi: mid, feasible: true, perPile: piles.map((p) => Math.ceil(p / mid)), need, H }, 3);
        hi = mid;
      } else {
        f.push(`${need} hours is too slow. Speed must be above ${mid}.`, { arr: piles, candidate: mid, lo: mid + 1, hi, feasible: false, perPile: piles.map((p) => Math.ceil(p / mid)), need, H }, 4);
        lo = mid + 1;
      }
    }
    f.push(`Minimum workable speed is ${lo} bananas per hour.`, { arr: piles, candidate: lo, lo, hi, answer: lo, perPile: piles.map((p) => Math.ceil(p / lo)), need: hours(lo), H }, 5);
    return f.all;
  },
};

export const twoPointers: VizAlgo = {
  slug: "two-pointers",
  name: "Two Pointers",
  topic: "two-pointers",
  kind: "array",
  difficulty: "Easy",
  tags: ["sorted array", "linear"],
  blurb: "On a sorted array, one pointer at each end. Move the pointer that can only push the sum in the direction you need.",
  complexity: { time: "O(n)", space: "O(1)", note: "Each pointer only moves inward, so together they take at most n steps." },
  pseudocode: [
    "l = 0; r = n - 1",
    "while l < r:",
    "  sum = a[l] + a[r]",
    "  if sum == target: return [l, r]",
    "  if sum < target: l++",
    "  else: r--",
  ],
  defaultInput: "2, 3, 5, 8, 11, 15 | 16",
  inputHint: "sorted numbers | target sum",
  related: ["two-sum-ii", "3sum", "container-with-most-water"],
  run(input) {
    const [arrPart, tPart] = splitOnPipe(input);
    const a = parseNums(arrPart).sort((x, y) => x - y);
    const target = parseNums(tPart, [a[0] + a[a.length - 1]])[0];
    const f = new Frames();
    let l = 0, r = a.length - 1;
    f.set("steps", 0);
    f.push(`Find two values summing to ${target}.`, { arr: a, target }, 0);
    while (l < r) {
      const sum = a[l] + a[r];
      f.bump("steps");
      f.push(`a[${l}] + a[${r}] = ${a[l]} + ${a[r]} = ${sum}.`, { arr: a, compare: [l, r], target, sum, pointers: [{ name: "l", index: l, color: C.active }, { name: "r", index: r, color: C.compare }] }, 2, { sum });
      if (sum === target) {
        f.push(`Found the pair at indices ${l} and ${r}.`, { arr: a, sorted: [l, r], target, sum }, 3);
        return f.all;
      }
      if (sum < target) {
        f.push(`${sum} is short of ${target}. Only a bigger left value can help, so move l right.`, { arr: a, compare: [l, r], target, sum }, 4);
        l++;
      } else {
        f.push(`${sum} overshoots ${target}. Move r left to shrink it.`, { arr: a, compare: [l, r], target, sum }, 5);
        r--;
      }
    }
    f.push("Pointers crossed without a match. No such pair exists.", { arr: a, target }, 5);
    return f.all;
  },
};

export const slidingWindow: VizAlgo = {
  slug: "sliding-window",
  name: "Sliding Window",
  topic: "sliding-window",
  kind: "array",
  difficulty: "Medium",
  tags: ["variable window", "linear"],
  blurb: "Longest subarray whose sum stays within a limit. Grow on the right, shrink on the left whenever the window breaks the rule.",
  complexity: { time: "O(n)", space: "O(1)", note: "Both pointers only move right, so each index is added once and removed once." },
  pseudocode: [
    "l = 0; sum = 0; best = 0",
    "for r from 0 to n-1:",
    "  sum += a[r]",
    "  while sum > limit:",
    "    sum -= a[l]; l++",
    "  best = max(best, r - l + 1)",
  ],
  defaultInput: "2, 1, 5, 1, 3, 2, 4 | 8",
  inputHint: "numbers | max allowed sum",
  related: ["minimum-size-subarray-sum", "longest-substring-without-repeating-characters", "max-consecutive-ones-iii"],
  run(input) {
    const [arrPart, limitPart] = splitOnPipe(input);
    const a = parseNums(arrPart, [2, 1, 5, 1, 3, 2, 4]).map((x) => Math.max(0, x));
    const limit = parseNums(limitPart, [8])[0];
    const f = new Frames();
    let l = 0, sum = 0, best = 0, bestRange: [number, number] = [0, -1];
    f.set("adds", 0).set("removes", 0);
    f.push(`Longest run whose sum stays at or below ${limit}.`, { arr: a, window: [0, -1], sum: 0, limit }, 0);
    for (let r = 0; r < a.length; r++) {
      sum += a[r];
      f.bump("adds");
      f.push(`Extend right to index ${r}. Window sum is ${sum}.`, { arr: a, window: [l, r], sum, limit, entering: r }, 2, { sum, best });
      while (sum > limit && l <= r) {
        sum -= a[l];
        f.bump("removes");
        f.push(`Sum ${sum + a[l]} broke the limit, so drop a[${l}] = ${a[l]} from the left.`, { arr: a, window: [l + 1, r], sum, limit, leaving: l }, 4, { sum, best });
        l++;
      }
      if (r - l + 1 > best) {
        best = r - l + 1;
        bestRange = [l, r];
        f.push(`New best window of length ${best}.`, { arr: a, window: [l, r], sum, limit, bestRange }, 5, { sum, best });
      }
    }
    f.push(`Longest valid window is length ${best}, indices ${bestRange[0]} to ${bestRange[1]}.`, { arr: a, window: bestRange, bestRange, sum, limit }, 5, { best });
    return f.all;
  },
};

export const slidingWindowMax: VizAlgo = {
  slug: "sliding-window-max",
  name: "Sliding Window Maximum",
  topic: "sliding-window",
  kind: "array",
  difficulty: "Hard",
  tags: ["monotonic deque", "linear"],
  blurb: "A deque of indices kept in decreasing value order. The front is always the maximum of the current window.",
  complexity: { time: "O(n)", space: "O(k)", note: "Each index is pushed once and popped once, which is why it beats the heap solution." },
  pseudocode: [
    "for r from 0 to n-1:",
    "  while deque and a[deque.back] <= a[r]: pop back",
    "  push r",
    "  if deque.front <= r - k: pop front",
    "  if r >= k-1: output a[deque.front]",
  ],
  defaultInput: "1, 3, -1, -3, 5, 3, 6, 7 | 3",
  inputHint: "numbers | window size k",
  related: ["sliding-window-maximum", "first-negative-in-window"],
  run(input) {
    const [arrPart, kPart] = splitOnPipe(input);
    const a = parseNums(arrPart, [1, 3, -1, -3, 5, 3, 6, 7]);
    const k = Math.max(1, Math.min(a.length, parseNums(kPart, [3])[0]));
    const f = new Frames();
    const dq: number[] = [];
    const out: number[] = [];
    f.push(`Window size ${k}. The deque holds candidate indices, biggest at the front.`, { arr: a, window: [0, -1], deque: [], out: [] }, 0);
    for (let r = 0; r < a.length; r++) {
      while (dq.length && a[dq[dq.length - 1]] <= a[r]) {
        const popped = dq.pop()!;
        f.bump("pops");
        f.push(`a[${r}] = ${a[r]} is at least a[${popped}] = ${a[popped]}, so ${a[popped]} can never be a maximum again. Drop it.`, { arr: a, window: [Math.max(0, r - k + 1), r], deque: [...dq], out: [...out], compare: [r, popped] }, 1);
      }
      dq.push(r);
      f.push(`Push index ${r}.`, { arr: a, window: [Math.max(0, r - k + 1), r], deque: [...dq], out: [...out], entering: r }, 2);
      if (dq[0] <= r - k) {
        const gone = dq.shift()!;
        f.push(`Index ${gone} has slid out of the window, so remove it from the front.`, { arr: a, window: [r - k + 1, r], deque: [...dq], out: [...out], leaving: gone }, 3);
      }
      if (r >= k - 1) {
        out.push(a[dq[0]]);
        f.push(`Window [${r - k + 1}..${r}] has maximum ${a[dq[0]]}.`, { arr: a, window: [r - k + 1, r], deque: [...dq], out: [...out], best: dq[0] }, 4);
      }
    }
    f.push(`Maximums: ${out.join(", ")}.`, { arr: a, deque: [...dq], out: [...out] }, 4);
    return f.all;
  },
};

export const kadane: VizAlgo = {
  slug: "kadane",
  name: "Kadane (Maximum Subarray)",
  topic: "dp",
  kind: "array",
  difficulty: "Medium",
  tags: ["dynamic programming", "linear"],
  blurb: "At every index decide whether to extend the previous best subarray or start fresh from here.",
  complexity: { time: "O(n)", space: "O(1)", note: "The simplest real DP: one state, one transition, two variables." },
  pseudocode: [
    "cur = a[0]; best = a[0]",
    "for i from 1 to n-1:",
    "  cur = max(a[i], cur + a[i])",
    "  best = max(best, cur)",
  ],
  defaultInput: "-2, 1, -3, 4, -1, 2, 1, -5, 4",
  inputHint: "Comma separated numbers, include negatives",
  related: ["maximum-subarray", "maximum-product-subarray", "maximum-sum-circular-subarray"],
  run(input) {
    const a = parseNums(input, [-2, 1, -3, 4, -1, 2, 1, -5, 4]);
    const f = new Frames();
    let cur = a[0], best = a[0], start = 0, bestL = 0, bestR = 0;
    f.push(`Best subarray ending at index 0 is just ${a[0]}.`, { arr: a, window: [0, 0], cur, best, bestRange: [0, 0] }, 0, { cur, best });
    for (let i = 1; i < a.length; i++) {
      const extend = cur + a[i];
      if (a[i] > extend) {
        cur = a[i];
        start = i;
        f.push(`Starting fresh at ${a[i]} beats extending to ${extend}. The old run was dragging us down.`, { arr: a, window: [i, i], cur, best, bestRange: [bestL, bestR], restart: i }, 2, { cur, best });
      } else {
        cur = extend;
        f.push(`Extending the run gives ${cur}, better than starting over at ${a[i]}.`, { arr: a, window: [start, i], cur, best, bestRange: [bestL, bestR] }, 2, { cur, best });
      }
      if (cur > best) {
        best = cur;
        bestL = start;
        bestR = i;
        f.push(`New global best of ${best}, from index ${bestL} to ${bestR}.`, { arr: a, window: [start, i], cur, best, bestRange: [bestL, bestR] }, 3, { cur, best });
      }
    }
    f.push(`Maximum subarray sum is ${best}, from index ${bestL} to ${bestR}.`, { arr: a, window: [bestL, bestR], bestRange: [bestL, bestR], cur, best }, 3, { best });
    return f.all;
  },
};

export const prefixSum: VizAlgo = {
  slug: "prefix-sum",
  name: "Prefix Sum & Subarray Count",
  topic: "prefix-sum",
  kind: "array",
  difficulty: "Medium",
  tags: ["hash map", "linear"],
  blurb: "Count subarrays summing to k. Every subarray sum is a difference of two prefix sums, so a map of seen prefixes does it in one pass.",
  complexity: { time: "O(n)", space: "O(n)", note: "Works with negative numbers, where sliding window does not." },
  pseudocode: [
    "count = {0: 1}; pre = 0; ans = 0",
    "for x in a:",
    "  pre += x",
    "  ans += count[pre - k]",
    "  count[pre]++",
  ],
  defaultInput: "1, 2, 3, -2, 5 | 3",
  inputHint: "numbers | target sum k",
  related: ["subarray-sum-equals-k", "contiguous-array", "subarray-with-xor-k"],
  run(input) {
    const [arrPart, kPart] = splitOnPipe(input);
    const a = parseNums(arrPart, [1, 2, 3, -2, 5]);
    const k = parseNums(kPart, [3])[0];
    const f = new Frames();
    const seen = new Map<number, number>([[0, 1]]);
    let pre = 0, ans = 0;
    const prefixes: number[] = [];
    f.push(`Counting subarrays that sum to ${k}. Seed the map with prefix 0 seen once, which covers subarrays starting at index 0.`, { arr: a, prefixes: [], map: [[0, 1]], k, ans }, 0);
    for (let i = 0; i < a.length; i++) {
      pre += a[i];
      prefixes.push(pre);
      const need = pre - k;
      const hits = seen.get(need) ?? 0;
      f.push(`Running prefix is ${pre}. A subarray ending here sums to ${k} exactly when an earlier prefix equals ${need}.`, { arr: a, prefixes: [...prefixes], map: [...seen.entries()], k, ans, compare: [i], need }, 3, { prefix: pre, answer: ans });
      if (hits) {
        ans += hits;
        f.push(`Prefix ${need} was seen ${hits} time${hits > 1 ? "s" : ""}, so that is ${hits} more subarray${hits > 1 ? "s" : ""}.`, { arr: a, prefixes: [...prefixes], map: [...seen.entries()], k, ans, compare: [i], need, hit: true }, 3, { prefix: pre, answer: ans });
      }
      seen.set(pre, (seen.get(pre) ?? 0) + 1);
      f.push(`Record prefix ${pre} in the map.`, { arr: a, prefixes: [...prefixes], map: [...seen.entries()], k, ans, compare: [i] }, 4, { prefix: pre, answer: ans });
    }
    f.push(`${ans} subarray${ans === 1 ? "" : "s"} sum to ${k}.`, { arr: a, prefixes, map: [...seen.entries()], k, ans }, 4, { answer: ans });
    return f.all;
  },
};

export const monotonicStack: VizAlgo = {
  slug: "monotonic-stack",
  name: "Monotonic Stack (Next Greater)",
  topic: "stack-queue",
  kind: "array",
  difficulty: "Medium",
  tags: ["stack", "linear"],
  blurb: "Keep a stack of indices with decreasing values. Every new element resolves the answer for everything it dominates.",
  complexity: { time: "O(n)", space: "O(n)", note: "Each index is pushed once and popped once, so the nested-looking loop is still linear." },
  pseudocode: [
    "for i from 0 to n-1:",
    "  while stack and a[stack.top] < a[i]:",
    "    j = stack.pop(); ans[j] = a[i]",
    "  stack.push(i)",
    "anything left on the stack has no greater element",
  ],
  defaultInput: "2, 1, 2, 4, 3, 5",
  inputHint: "Comma separated numbers",
  related: ["daily-temperatures", "next-greater-element-i", "largest-rectangle-in-histogram"],
  run(input) {
    const a = parseNums(input, [2, 1, 2, 4, 3, 5]);
    const f = new Frames();
    const st: number[] = [];
    const ans = new Array(a.length).fill(-1);
    f.push("For each element, find the first larger value to its right.", { arr: a, stack: [], ans: [...ans] }, 0);
    for (let i = 0; i < a.length; i++) {
      f.push(`Look at a[${i}] = ${a[i]}.`, { arr: a, stack: [...st], ans: [...ans], compare: [i] }, 0);
      while (st.length && a[st[st.length - 1]] < a[i]) {
        const j = st.pop()!;
        ans[j] = a[i];
        f.bump("resolved");
        f.push(`a[${i}] = ${a[i]} is the first greater value for a[${j}] = ${a[j]}. Pop it and record the answer.`, { arr: a, stack: [...st], ans: [...ans], compare: [i], resolved: j }, 2);
      }
      st.push(i);
      f.push(`Push index ${i}. The stack stays in decreasing value order.`, { arr: a, stack: [...st], ans: [...ans], compare: [i] }, 3);
    }
    f.push(`Indices still on the stack have nothing greater to their right.`, { arr: a, stack: [...st], ans: [...ans], unresolved: [...st] }, 4);
    return f.all;
  },
};

export const cyclicSort: VizAlgo = {
  slug: "cyclic-sort",
  name: "Cyclic Sort",
  topic: "arrays",
  kind: "array",
  difficulty: "Medium",
  tags: ["in place", "linear", "index mapping"],
  blurb: "When values are 1..n, each value has a home index. Swap until everything is home, then whatever is misplaced is your answer.",
  complexity: { time: "O(n)", space: "O(1)", note: "Every swap places at least one value correctly, so the loop runs at most 2n times." },
  pseudocode: [
    "i = 0",
    "while i < n:",
    "  j = a[i] - 1",
    "  if a[i] != a[j]: swap(a[i], a[j])",
    "  else: i++",
    "scan for the first index where a[i] != i+1",
  ],
  defaultInput: "3, 1, 5, 4, 2",
  inputHint: "A permutation of 1..n, possibly with a duplicate",
  related: ["find-the-duplicate-number", "first-missing-positive", "find-all-numbers-disappeared"],
  run(input) {
    const a = parseNums(input, [3, 1, 5, 4, 2]).map((x) => Math.round(x));
    const f = new Frames();
    const n = a.length;
    let i = 0;
    f.set("swaps", 0);
    f.push("Value v belongs at index v-1. Keep sending values home.", { arr: a, home: a.map((v, idx) => v === idx + 1) }, 0);
    let guard = 0;
    while (i < n && guard++ < 200) {
      const j = a[i] - 1;
      if (j >= 0 && j < n && a[i] !== a[j]) {
        f.push(`a[${i}] = ${a[i]} belongs at index ${j}, which currently holds ${a[j]}.`, { arr: a, compare: [i, j], home: a.map((v, idx) => v === idx + 1) }, 2);
        [a[i], a[j]] = [a[j], a[i]];
        f.bump("swaps");
        f.push(`Swap. Index ${j} is now correct.`, { arr: a, swap: [i, j], home: a.map((v, idx) => v === idx + 1) }, 2);
      } else {
        f.push(a[i] === i + 1 ? `a[${i}] is already home.` : `a[${i}] = ${a[i]} cannot be placed, it duplicates the value already at index ${j}.`, { arr: a, compare: [i], home: a.map((v, idx) => v === idx + 1) }, 3);
        i++;
      }
    }
    const bad = a.findIndex((v, idx) => v !== idx + 1);
    f.push(
      bad === -1 ? "Everything is in place, so the array was a clean permutation." : `Index ${bad} holds ${a[bad]} instead of ${bad + 1}. That mismatch is the duplicate, and ${bad + 1} is missing.`,
      { arr: a, home: a.map((v, idx) => v === idx + 1), answer: bad },
      5,
    );
    return f.all;
  },
};

export const quickselect: VizAlgo = {
  slug: "quickselect",
  name: "Quickselect",
  topic: "sorting",
  kind: "array",
  difficulty: "Medium",
  tags: ["partition", "expected linear"],
  blurb: "Partition around a pivot, then recurse only into the side that contains the rank you want.",
  complexity: { time: "O(n) expected, O(n^2) worst", space: "O(1)", note: "Halving the work each time gives n + n/2 + n/4 ... which sums to 2n." },
  pseudocode: [
    "select(lo, hi, k):",
    "  p = partition(lo, hi)",
    "  if p == k: return a[p]",
    "  if p < k: select(p+1, hi, k)",
    "  else: select(lo, p-1, k)",
  ],
  defaultInput: "7, 10, 4, 3, 20, 15 | 3",
  inputHint: "numbers | k for the kth smallest",
  related: ["kth-largest-element-in-an-array", "k-closest-points-to-origin"],
  run(input) {
    const [arrPart, kPart] = splitOnPipe(input);
    const a = parseNums(arrPart, [7, 10, 4, 3, 20, 15]);
    const k = Math.max(1, Math.min(a.length, parseNums(kPart, [3])[0]));
    const target = k - 1;
    const f = new Frames();
    f.set("comparisons", 0);
    f.push(`Looking for the ${k}th smallest value, which lives at final index ${target}.`, { arr: a, target }, 0);

    const partition = (lo: number, hi: number) => {
      const pivot = a[hi];
      let i = lo;
      f.push(`Partition [${lo}..${hi}] around pivot ${pivot}.`, { arr: a, range: [lo, hi], pivot: hi, target }, 1);
      for (let j = lo; j < hi; j++) {
        f.bump("comparisons");
        if (a[j] < pivot) {
          [a[i], a[j]] = [a[j], a[i]];
          f.push(`${a[i]} is below the pivot, keep it on the left.`, { arr: a, range: [lo, hi], pivot: hi, swap: [i, j], target }, 1);
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      f.push(`Pivot lands at index ${i}, which is its final position.`, { arr: a, range: [lo, hi], swap: [i, hi], sorted: [i], target }, 1);
      return i;
    };

    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      const p = partition(lo, hi);
      if (p === target) {
        f.push(`Pivot index ${p} is exactly the rank we want. Answer is ${a[p]}.`, { arr: a, sorted: [p], answer: a[p], target }, 2);
        break;
      }
      if (p < target) {
        f.push(`Rank ${target} is to the right of ${p}, so discard the left side entirely.`, { arr: a, range: [p + 1, hi], discarded: [lo, p], target }, 3);
        lo = p + 1;
      } else {
        f.push(`Rank ${target} is to the left of ${p}, so discard the right side.`, { arr: a, range: [lo, p - 1], discarded: [p, hi], target }, 4);
        hi = p - 1;
      }
    }
    return f.all;
  },
};

export const ARRAY_ALGOS = [
  binarySearch, binarySearchAnswer, twoPointers, slidingWindow, slidingWindowMax,
  kadane, prefixSum, monotonicStack, cyclicSort, quickselect,
];
