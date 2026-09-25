export interface ComplexityQuestion {
  id: string;
  code: string;
  lang: string;
  options: string[];
  answer: number;
  why: string;
  topic: string;
}

/** Complexity reading drills. Each one targets a specific misreading. */
export const COMPLEXITY_QUESTIONS: ComplexityQuestion[] = [
  {
    id: "cq-nested-half", lang: "js", topic: "loops",
    code: `for (let i = 0; i < n; i++)\n  for (let j = i; j < n; j++)\n    work();`,
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(n^2 / 2)"],
    answer: 2,
    why: "The inner loop shrinks, so the total is n(n+1)/2 iterations. Constants are dropped, so it is quadratic. O(n^2 / 2) is not standard notation.",
  },
  {
    id: "cq-halving", lang: "js", topic: "loops",
    code: `while (n > 1) {\n  n = Math.floor(n / 2);\n  work();\n}`,
    options: ["O(1)", "O(log n)", "O(n)", "O(sqrt n)"],
    answer: 1,
    why: "Halving repeatedly reaches one after log base two of n steps.",
  },
  {
    id: "cq-outer-log", lang: "js", topic: "loops",
    code: `for (let i = 1; i < n; i *= 2)\n  for (let j = 0; j < n; j++)\n    work();`,
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    answer: 1,
    why: "The outer loop multiplies, so it runs log n times, and each pass does n work.",
  },
  {
    id: "cq-string-concat", lang: "js", topic: "strings",
    code: `let s = "";\nfor (let i = 0; i < n; i++)\n  s += "x";   // strings are immutable`,
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"],
    answer: 2,
    why: "Each concatenation copies the whole string, so the total copying is 1 + 2 + ... + n, which is quadratic. Use an array and join instead.",
  },
  {
    id: "cq-fib-naive", lang: "js", topic: "recursion",
    code: `function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}`,
    options: ["O(n)", "O(n^2)", "O(2^n)", "O(n log n)"],
    answer: 2,
    why: "Each call branches into two, and the tree has depth n, so the call count grows exponentially. Memoising collapses it to linear.",
  },
  {
    id: "cq-merge-sort", lang: "js", topic: "divide and conquer",
    code: `function sort(a) {\n  if (a.length < 2) return a;\n  const mid = a.length >> 1;\n  return merge(sort(a.slice(0, mid)), sort(a.slice(mid)));\n}`,
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    answer: 1,
    why: "log n levels of recursion, linear merging work per level.",
  },
  {
    id: "cq-heap-build", lang: "js", topic: "heap",
    code: `for (let i = Math.floor(n / 2) - 1; i >= 0; i--)\n  siftDown(i, n);`,
    options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
    answer: 0,
    why: "Most nodes are near the bottom and barely sift, so the sum telescopes to linear. Building by repeated insertion would be n log n.",
  },
  {
    id: "cq-two-pointer", lang: "js", topic: "two pointers",
    code: `let l = 0, r = n - 1;\nwhile (l < r) {\n  if (cond()) l++;\n  else r--;\n}`,
    options: ["O(log n)", "O(n)", "O(n^2)", "O(1)"],
    answer: 1,
    why: "Each iteration moves one pointer inward by one, so there are at most n iterations total.",
  },
  {
    id: "cq-sliding", lang: "js", topic: "sliding window",
    code: `let l = 0;\nfor (let r = 0; r < n; r++) {\n  add(a[r]);\n  while (!valid()) { remove(a[l]); l++; }\n}`,
    options: ["O(n)", "O(n^2)", "O(n log n)", "O(2^n)"],
    answer: 0,
    why: "The inner while looks nested but the left pointer only ever moves forward, so each index is removed at most once. Amortised linear.",
  },
  {
    id: "cq-subsets", lang: "js", topic: "backtracking",
    code: `function dfs(i, cur) {\n  if (i === n) { out.push([...cur]); return; }\n  cur.push(a[i]); dfs(i + 1, cur); cur.pop();\n  dfs(i + 1, cur);\n}`,
    options: ["O(n^2)", "O(2^n)", "O(n * 2^n)", "O(n!)"],
    answer: 2,
    why: "There are 2^n subsets and copying each one costs up to n, so the output dominates at n times 2^n.",
  },
  {
    id: "cq-permutations", lang: "js", topic: "backtracking",
    code: `function dfs(i) {\n  if (i === n) { record(); return; }\n  for (let j = i; j < n; j++) {\n    swap(i, j); dfs(i + 1); swap(i, j);\n  }\n}`,
    options: ["O(2^n)", "O(n^2)", "O(n!)", "O(n log n)"],
    answer: 2,
    why: "n choices, then n-1, then n-2, which multiplies out to n factorial.",
  },
  {
    id: "cq-dijkstra", lang: "js", topic: "graphs",
    code: `// adjacency list, binary heap priority queue\nwhile (pq.size) {\n  const [d, u] = pq.pop();\n  for (const [v, w] of adj[u]) relax(v, d + w);\n}`,
    options: ["O(V^2)", "O(E log V)", "O(V + E)", "O(V E)"],
    answer: 1,
    why: "Each edge can push one heap entry, and every heap operation costs log V.",
  },
  {
    id: "cq-bfs", lang: "js", topic: "graphs",
    code: `const q = [src];\nwhile (q.length) {\n  const u = q.shift();\n  for (const v of adj[u]) if (!seen[v]) { seen[v] = 1; q.push(v); }\n}`,
    options: ["O(V)", "O(V + E)", "O(V log V)", "O(V^2)"],
    answer: 1,
    why: "Every vertex is dequeued once and every edge is examined once.",
  },
  {
    id: "cq-knapsack", lang: "js", topic: "dp",
    code: `for (let i = 1; i <= n; i++)\n  for (let w = 0; w <= W; w++)\n    dp[i][w] = best(dp[i-1][w], dp[i-1][w - wt[i]]);`,
    options: ["O(n)", "O(n * W)", "O(2^n)", "O(n^2)"],
    answer: 1,
    why: "One cell per item and capacity pair. This is pseudo-polynomial: it depends on the numeric value of W, not just the input length.",
  },
  {
    id: "cq-sieve", lang: "js", topic: "math",
    code: `for (let p = 2; p * p <= n; p++)\n  if (isPrime[p])\n    for (let m = p * p; m <= n; m += p) isPrime[m] = false;`,
    options: ["O(n)", "O(n log log n)", "O(n log n)", "O(n sqrt n)"],
    answer: 1,
    why: "The harmonic sum over primes gives n log log n, which is effectively linear in practice.",
  },
  {
    id: "cq-trie", lang: "js", topic: "tries",
    code: `let node = root;\nfor (const ch of word) node = node.children[ch];`,
    options: ["O(1)", "O(word length)", "O(dictionary size)", "O(log dictionary)"],
    answer: 1,
    why: "Cost depends only on the word length, which is why tries scale with dictionary size for free.",
  },
  {
    id: "cq-union-find", lang: "js", topic: "graphs",
    code: `// union by size + path compression\nfind(x); union(a, b);`,
    options: ["O(1) exactly", "O(log n)", "near O(1) amortised", "O(n)"],
    answer: 2,
    why: "The bound is the inverse Ackermann function, which is under five for any realistic n, so it is effectively constant but not exactly constant.",
  },
  {
    id: "cq-space-recursion", lang: "js", topic: "space",
    code: `function dfs(node) {\n  if (!node) return 0;\n  return 1 + Math.max(dfs(node.left), dfs(node.right));\n}`,
    options: ["O(1) space", "O(log n) space always", "O(h) space", "O(n) space always"],
    answer: 2,
    why: "The call stack is as deep as the tree height. That is log n only if the tree is balanced, and n in the worst case.",
  },
  {
    id: "cq-sort-then-scan", lang: "js", topic: "sorting",
    code: `a.sort((x, y) => x - y);\nfor (let i = 0; i < n; i++) work();`,
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    answer: 1,
    why: "The sort dominates the linear scan, so the total is n log n.",
  },
  {
    id: "cq-map-worst", lang: "js", topic: "hashing",
    code: `const seen = new Map();\nfor (const x of a) seen.set(x, (seen.get(x) ?? 0) + 1);`,
    options: ["O(n) average, O(n^2) worst", "O(n) always", "O(n log n)", "O(1)"],
    answer: 0,
    why: "Hash operations are constant on average, but adversarial collisions degrade every operation to linear, making the loop quadratic.",
  },
  {
    id: "cq-matrix-spiral", lang: "js", topic: "matrix",
    code: `while (top <= bottom && left <= right) {\n  walkTop(); walkRight(); walkBottom(); walkLeft();\n}`,
    options: ["O(n)", "O(rows * cols)", "O(rows + cols)", "O((rows * cols)^2)"],
    answer: 1,
    why: "Each cell is visited exactly once, so it is linear in the number of cells.",
  },
  {
    id: "cq-binary-search-answer", lang: "js", topic: "binary search",
    code: `let lo = 1, hi = maxVal;\nwhile (lo < hi) {\n  const mid = (lo + hi) >> 1;\n  if (feasible(mid)) hi = mid; else lo = mid + 1;\n}\n// feasible() scans the array once`,
    options: ["O(log maxVal)", "O(n log maxVal)", "O(n)", "O(n^2)"],
    answer: 1,
    why: "log maxVal iterations, each running a linear feasibility check.",
  },
];

export interface PatternQuestion {
  prompt: string;
  answer: string;
  decoys: string[];
}

/** Read the signal, name the pattern. */
export const PATTERN_QUESTIONS: PatternQuestion[] = [
  { prompt: "Find the longest substring with at most K distinct characters", answer: "sliding-window-variable", decoys: ["binary-search-sorted", "knapsack", "monotonic-stack"] },
  { prompt: "Return the next greater element for every index", answer: "monotonic-stack", decoys: ["sliding-window-fixed", "two-pointers-opposite", "dp-1d"] },
  { prompt: "Minimum eating speed so all bananas are finished within H hours", answer: "binary-search-answer", decoys: ["greedy-exchange", "binary-search-sorted", "top-k-heap"] },
  { prompt: "Detect whether a linked list has a cycle using constant space", answer: "fast-slow", decoys: ["in-place-reversal", "two-sum-hash", "cyclic-sort"] },
  { prompt: "Count subarrays whose sum equals k, with negative numbers allowed", answer: "prefix-sum", decoys: ["sliding-window-variable", "two-pointers-opposite", "kadane"] },
  { prompt: "Can these courses be finished given prerequisite pairs", answer: "topological-sort", decoys: ["graph-bfs", "union-find", "tree-dfs"] },
  { prompt: "Return the k most frequent elements", answer: "top-k-heap", decoys: ["quickselect", "two-sum-hash", "merge-intervals"] },
  { prompt: "Array holds 1..n with one duplicate, find it in place", answer: "cyclic-sort", decoys: ["binary-search-sorted", "bit-tricks", "two-sum-hash"] },
  { prompt: "Maximum sum of any contiguous subarray", answer: "kadane", decoys: ["sliding-window-fixed", "prefix-sum", "divide-conquer"] },
  { prompt: "Minimum number of meeting rooms needed", answer: "sweep-line", decoys: ["merge-intervals", "greedy-exchange", "two-heaps"] },
  { prompt: "Find the median of a stream of numbers", answer: "two-heaps", decoys: ["top-k-heap", "quickselect", "segment-tree"] },
  { prompt: "Cheapest path in a weighted graph with non-negative edges", answer: "dijkstra", decoys: ["graph-bfs", "mst", "topological-sort"] },
  { prompt: "All subsets of a set of distinct integers", answer: "subsets-backtracking", decoys: ["permutations", "bitmask-dp", "grid-backtracking"] },
  { prompt: "Can this array be split into two equal sum halves", answer: "knapsack", decoys: ["unbounded-knapsack", "greedy-exchange", "prefix-sum"] },
  { prompt: "Fewest coins to make an amount, coins reusable", answer: "unbounded-knapsack", decoys: ["knapsack", "greedy-exchange", "dp-1d"] },
  { prompt: "Longest increasing subsequence in n log n", answer: "lis-dp", decoys: ["lcs-dp", "kadane", "binary-search-sorted"] },
  { prompt: "Minimum edits to turn one word into another", answer: "lcs-dp", decoys: ["string-matching", "interval-dp", "dp-1d"] },
  { prompt: "Which edges to keep so all cities are connected at least cost", answer: "mst", decoys: ["dijkstra", "union-find", "topological-sort"] },
  { prompt: "Add and search words where a dot matches any letter", answer: "trie-prefix", decoys: ["string-matching", "design-ds", "two-sum-hash"] },
  { prompt: "Find the element that appears once while all others appear twice", answer: "bit-tricks", decoys: ["two-sum-hash", "cyclic-sort", "quickselect"] },
  { prompt: "Design a cache with O(1) get and put that evicts the least recent", answer: "design-ds", decoys: ["top-k-heap", "two-heaps", "segment-tree"] },
  { prompt: "Maximum sum of exactly k consecutive elements", answer: "sliding-window-fixed", decoys: ["sliding-window-variable", "prefix-sum", "kadane"] },
  { prompt: "Two numbers in a sorted array that add to a target, constant space", answer: "two-pointers-opposite", decoys: ["two-sum-hash", "binary-search-sorted", "sliding-window-fixed"] },
  { prompt: "Place N queens so none attack each other", answer: "grid-backtracking", decoys: ["permutations", "bitmask-dp", "subsets-backtracking"] },
  { prompt: "Merge all overlapping ranges into the fewest ranges", answer: "merge-intervals", decoys: ["sweep-line", "greedy-exchange", "two-pointers-opposite"] },
  { prompt: "Find a pattern inside a text in linear time", answer: "string-matching", decoys: ["trie-prefix", "sliding-window-fixed", "two-pointers-opposite"] },
  { prompt: "Kth largest element without fully sorting", answer: "quickselect", decoys: ["top-k-heap", "divide-conquer", "binary-search-sorted"] },
  { prompt: "Are these two accounts part of the same merged group", answer: "union-find", decoys: ["graph-dfs", "topological-sort", "two-sum-hash"] },
  { prompt: "Burst balloons to maximise coins, order matters", answer: "interval-dp", decoys: ["knapsack", "greedy-exchange", "dp-grid"] },
  { prompt: "Shortest transformation sequence between two words", answer: "graph-bfs", decoys: ["graph-dfs", "dijkstra", "trie-prefix"] },
  { prompt: "Assign n tasks to n people at minimum cost, n is at most 18", answer: "bitmask-dp", decoys: ["knapsack", "greedy-exchange", "permutations"] },
  { prompt: "Maximum profit with at most k stock transactions", answer: "dp-stocks", decoys: ["kadane", "knapsack", "greedy-exchange"] },
  { prompt: "Number of unique paths from the top left to the bottom right", answer: "dp-grid", decoys: ["graph-bfs", "grid-backtracking", "dp-1d"] },
  { prompt: "Maximum in every window of size k, in linear time", answer: "monotonic-deque", decoys: ["top-k-heap", "monotonic-stack", "sliding-window-fixed"] },
  { prompt: "Validate that a binary tree satisfies the search property", answer: "bst-property", decoys: ["tree-dfs", "tree-bfs", "divide-conquer"] },
  { prompt: "Right side view of a binary tree", answer: "tree-bfs", decoys: ["tree-dfs", "bst-property", "graph-dfs"] },
  { prompt: "Diameter of a binary tree", answer: "tree-dfs", decoys: ["tree-bfs", "interval-dp", "divide-conquer"] },
  { prompt: "Count islands in a grid of land and water", answer: "graph-dfs", decoys: ["graph-bfs", "union-find", "dp-grid"] },
  { prompt: "Range sum queries while values keep changing", answer: "segment-tree", decoys: ["prefix-sum", "design-ds", "monotonic-stack"] },
  { prompt: "Rotate a matrix by 90 degrees without extra space", answer: "matrix-manip", decoys: ["dp-grid", "grid-backtracking", "two-pointers-opposite"] },
];

export const shuffle = <T,>(arr: T[], seed = Math.random()): T[] => {
  const a = [...arr];
  let s = Math.floor(seed * 1e9) || 1;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
