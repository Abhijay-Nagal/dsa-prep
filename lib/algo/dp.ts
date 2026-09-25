import type { VizAlgo } from "@/lib/types";
import { Frames, parseNums, parseWords, splitOnPipe } from "./util";

export const dpFib: VizAlgo = {
  slug: "dp-fib",
  name: "Memoisation vs Brute Force",
  topic: "dp",
  kind: "recursion",
  difficulty: "Easy",
  tags: ["recursion tree", "memoisation", "overlapping subproblems"],
  blurb:
    "Watch the naive Fibonacci recursion explode, then watch a cache collapse it. This is the moment dynamic programming makes sense.",
  complexity: { time: "O(2^n) naive, O(n) memoised", space: "O(n)", note: "Overlapping subproblems is the whole reason DP exists. The recursion tree shows them directly." },
  pseudocode: [
    "fib(n):",
    "  if n <= 1: return n",
    "  if memo has n: return memo[n]     // the only new line",
    "  memo[n] = fib(n-1) + fib(n-2)",
    "  return memo[n]",
  ],
  defaultInput: "6",
  inputHint: "A number from 4 to 9",
  related: ["climbing-stairs", "min-cost-climbing-stairs", "house-robber"],
  run(input) {
    const n = Math.max(2, Math.min(9, parseNums(input, [6])[0]));
    const f = new Frames();

    // pass 1: naive
    let nodes: { id: number; label: string; parent: number | null; depth: number; state: string }[] = [];
    let calls = 0;
    const naive = (k: number, parent: number | null, depth: number): number => {
      const id = nodes.length;
      calls++;
      nodes.push({ id, label: `fib(${k})`, parent, depth, state: "active" });
      f.set("calls", calls);
      f.push(`Call fib(${k}).`, { nodes: nodes.map((x) => ({ ...x })), mode: "naive", current: id }, 0);
      if (k <= 1) {
        nodes[id].state = "base";
        f.push(`fib(${k}) is a base case, returns ${k}.`, { nodes: nodes.map((x) => ({ ...x })), mode: "naive", current: id }, 1);
        return k;
      }
      const a = naive(k - 1, id, depth + 1);
      const b = naive(k - 2, id, depth + 1);
      nodes[id].state = "done";
      nodes[id].label = `fib(${k})=${a + b}`;
      f.push(`fib(${k}) returns ${a + b}.`, { nodes: nodes.map((x) => ({ ...x })), mode: "naive", current: id }, 3);
      return a + b;
    };
    naive(n, null, 0);
    f.push(`Naive recursion made ${calls} calls for fib(${n}). Notice how many identical subtrees appear.`, { nodes: nodes.map((x) => ({ ...x })), mode: "naive", done: true }, 3, { calls });

    // pass 2: memoised
    nodes = [];
    const memo = new Map<number, number>();
    let memoCalls = 0;
    const memoised = (k: number, parent: number | null, depth: number): number => {
      const id = nodes.length;
      memoCalls++;
      nodes.push({ id, label: `fib(${k})`, parent, depth, state: "active" });
      f.set("calls", memoCalls);
      if (memo.has(k)) {
        nodes[id].state = "memo";
        nodes[id].label = `fib(${k})=${memo.get(k)}`;
        f.push(`fib(${k}) is already in the cache. Return ${memo.get(k)} without recursing, and the whole subtree below disappears.`, { nodes: nodes.map((x) => ({ ...x })), mode: "memo", current: id, memo: [...memo.entries()] }, 2);
        return memo.get(k)!;
      }
      f.push(`fib(${k}) is not cached yet.`, { nodes: nodes.map((x) => ({ ...x })), mode: "memo", current: id, memo: [...memo.entries()] }, 2);
      if (k <= 1) {
        nodes[id].state = "base";
        memo.set(k, k);
        f.push(`Base case, returns ${k}.`, { nodes: nodes.map((x) => ({ ...x })), mode: "memo", current: id, memo: [...memo.entries()] }, 1);
        return k;
      }
      const a = memoised(k - 1, id, depth + 1);
      const b = memoised(k - 2, id, depth + 1);
      memo.set(k, a + b);
      nodes[id].state = "done";
      nodes[id].label = `fib(${k})=${a + b}`;
      f.push(`Cache fib(${k}) = ${a + b}.`, { nodes: nodes.map((x) => ({ ...x })), mode: "memo", current: id, memo: [...memo.entries()] }, 3);
      return a + b;
    };
    memoised(n, null, 0);
    f.push(`Memoisation cut ${calls} calls down to ${memoCalls}. Same recursion, one extra line.`, { nodes: nodes.map((x) => ({ ...x })), mode: "memo", done: true, memo: [...memo.entries()] }, 4, { calls: memoCalls, naiveCalls: calls });
    return f.all;
  },
};

export const knapsack: VizAlgo = {
  slug: "knapsack",
  name: "0/1 Knapsack",
  topic: "dp",
  kind: "dptable",
  difficulty: "Medium",
  tags: ["two dimensional DP", "take or skip"],
  blurb: "Each item is taken or skipped under a shared capacity. The table row i, column w is the best value using the first i items within weight w.",
  complexity: { time: "O(n * W)", space: "O(W) after rolling the rows", note: "Pseudo-polynomial: it scales with the numeric capacity, not just the item count." },
  pseudocode: [
    "for i in 1..n:",
    "  for w in 0..W:",
    "    skip = dp[i-1][w]",
    "    take = (wt[i] <= w) ? val[i] + dp[i-1][w - wt[i]] : -inf",
    "    dp[i][w] = max(skip, take)",
  ],
  defaultInput: "1:1, 4:3, 5:4, 7:5 | 7",
  inputHint: "value:weight pairs | capacity",
  related: ["zero-one-knapsack", "partition-equal-subset-sum", "target-sum", "ones-and-zeroes"],
  run(input) {
    const [itemPart, capPart] = splitOnPipe(input);
    const items = itemPart
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [v, w] = s.split(":").map((x) => Math.max(0, Math.round(Number(x) || 0)));
        return { v: v || 1, w: w || 1 };
      })
      .slice(0, 8);
    const list = items.length ? items : [{ v: 1, w: 1 }, { v: 4, w: 3 }, { v: 5, w: 4 }, { v: 7, w: 5 }];
    const W = Math.max(1, Math.min(15, Math.round(parseNums(capPart, [7])[0])));
    const n = list.length;
    const f = new Frames();
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    const rowLabels = ["none", ...list.map((it, i) => `item ${i + 1} (v${it.v}/w${it.w})`)];
    const colLabels = Array.from({ length: W + 1 }, (_, w) => String(w));
    f.push("Row zero means no items available, so every capacity gives value zero.", { table: dp.map((r) => [...r]), rowLabels, colLabels }, 0);
    for (let i = 1; i <= n; i++) {
      const { v, w } = list[i - 1];
      for (let cap = 0; cap <= W; cap++) {
        const skip = dp[i - 1][cap];
        const canTake = w <= cap;
        const take = canTake ? v + dp[i - 1][cap - w] : -1;
        dp[i][cap] = Math.max(skip, take);
        f.push(
          canTake
            ? `Item ${i} weighs ${w}. Skip gives ${skip}, take gives ${v} + ${dp[i - 1][cap - w]} = ${take}. Best is ${dp[i][cap]}.`
            : `Item ${i} weighs ${w}, which does not fit in capacity ${cap}. Carry ${skip} down.`,
          {
            table: dp.map((r) => [...r]),
            rowLabels, colLabels,
            cursor: [i, cap],
            deps: canTake ? [[i - 1, cap], [i - 1, cap - w]] : [[i - 1, cap]],
          },
          canTake ? 4 : 2,
        );
      }
    }
    // reconstruct
    const chosen: number[] = [];
    let cap = W;
    for (let i = n; i > 0; i--) {
      if (dp[i][cap] !== dp[i - 1][cap]) {
        chosen.push(i);
        cap -= list[i - 1].w;
      }
    }
    f.push(`Best value is ${dp[n][W]}, using item${chosen.length === 1 ? "" : "s"} ${chosen.reverse().join(", ") || "none"}. Walk backwards through the table to recover which items were taken.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [n, W], chosen, done: true }, 4);
    return f.all;
  },
};

export const lcsViz: VizAlgo = {
  slug: "lcs",
  name: "Longest Common Subsequence",
  topic: "dp",
  kind: "dptable",
  difficulty: "Medium",
  tags: ["two sequences", "prefix state"],
  blurb: "Compare the last characters of two prefixes. A match extends the diagonal, a mismatch takes the better of dropping one character from either side.",
  complexity: { time: "O(n * m)", space: "O(min(n, m))", note: "Edit distance, shortest common supersequence and diff tools are the same recurrence with different costs." },
  pseudocode: [
    "for i in 1..n:",
    "  for j in 1..m:",
    "    if a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1] + 1",
    "    else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
  ],
  defaultInput: "ABCBDAB | BDCABA",
  inputHint: "first string | second string",
  related: ["longest-common-subsequence", "edit-distance", "longest-palindromic-subsequence"],
  run(input) {
    const [aPart, bPart] = splitOnPipe(input);
    const a = (aPart.trim() || "ABCBDAB").replace(/\s/g, "").slice(0, 10);
    const b = (bPart.trim() || "BDCABA").replace(/\s/g, "").slice(0, 10);
    const f = new Frames();
    const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    const rowLabels = ["-", ...a.split("")];
    const colLabels = ["-", ...b.split("")];
    f.push("Row and column zero mean one string is empty, so the common subsequence is empty.", { table: dp.map((r) => [...r]), rowLabels, colLabels }, 0);
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          f.push(`${a[i - 1]} matches ${b[j - 1]}, so extend the diagonal: ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [i, j], deps: [[i - 1, j - 1]], match: true }, 2);
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          f.push(`${a[i - 1]} and ${b[j - 1]} differ, so take the better of dropping either character: ${dp[i][j]}.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [i, j], deps: [[i - 1, j], [i, j - 1]] }, 3);
        }
      }
    }
    // reconstruct
    let i = a.length, j = b.length;
    const path: [number, number][] = [];
    let seq = "";
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { seq = a[i - 1] + seq; path.push([i, j]); i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    f.push(`Length is ${dp[a.length][b.length]} and one such subsequence is "${seq}". Walk backwards from the corner to recover it.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [a.length, b.length], path, answer: seq, done: true }, 3);
    return f.all;
  },
};

export const coinChange: VizAlgo = {
  slug: "coin-change",
  name: "Coin Change",
  topic: "dp",
  kind: "dptable",
  difficulty: "Medium",
  tags: ["unbounded knapsack", "bottom up"],
  blurb: "Fewest coins for each amount from zero upward. Each cell asks: which coin was the last one I used?",
  complexity: { time: "O(coins * amount)", space: "O(amount)", note: "Greedy fails here. With coins 1, 3 and 4, greedy makes 6 as 4+1+1 while the answer is 3+3." },
  pseudocode: [
    "dp[0] = 0; dp[rest] = infinity",
    "for amount from 1 to target:",
    "  for coin in coins:",
    "    if coin <= amount:",
    "      dp[amount] = min(dp[amount], dp[amount - coin] + 1)",
  ],
  defaultInput: "1, 3, 4 | 6",
  inputHint: "coin values | target amount",
  related: ["coin-change", "coin-change-ii", "perfect-squares", "combination-sum-iv"],
  run(input) {
    const [coinPart, amtPart] = splitOnPipe(input);
    const coins = parseNums(coinPart, [1, 3, 4]).map((x) => Math.max(1, Math.round(x))).slice(0, 5);
    const target = Math.max(1, Math.min(18, Math.round(parseNums(amtPart, [6])[0])));
    const f = new Frames();
    const INF = Infinity;
    const dp = new Array(target + 1).fill(INF);
    dp[0] = 0;
    const pick = new Array(target + 1).fill(-1);
    const render = () => dp.map((x) => (x === INF ? "inf" : x));
    f.push("Zero coins make amount zero. Everything else starts unreachable.", { table: [render()], rowLabels: ["min coins"], colLabels: dp.map((_, i) => String(i)) }, 0);
    for (let amt = 1; amt <= target; amt++) {
      for (const c of coins) {
        if (c > amt) {
          f.push(`Coin ${c} is larger than amount ${amt}, so it cannot be the last coin.`, { table: [render()], rowLabels: ["min coins"], colLabels: dp.map((_, i) => String(i)), cursor: [0, amt] }, 3);
          continue;
        }
        const cand = dp[amt - c] === INF ? INF : dp[amt - c] + 1;
        const better = cand < dp[amt];
        if (better) { dp[amt] = cand; pick[amt] = c; }
        f.push(
          cand === INF
            ? `Using coin ${c} would need amount ${amt - c}, which is unreachable.`
            : `Use coin ${c} last: ${dp[amt - c]} + 1 = ${cand}. ${better ? "That is the new best." : `Current best ${dp[amt] === INF ? "infinity" : dp[amt]} is not beaten.`}`,
          { table: [render()], rowLabels: ["min coins"], colLabels: dp.map((_, i) => String(i)), cursor: [0, amt], deps: [[0, amt - c]], coin: c },
          4,
        );
      }
    }
    const used: number[] = [];
    let cur = target;
    while (cur > 0 && pick[cur] > 0) { used.push(pick[cur]); cur -= pick[cur]; }
    f.push(
      dp[target] === INF
        ? `Amount ${target} cannot be made from these coins.`
        : `Fewest coins for ${target} is ${dp[target]}: ${used.join(" + ")}.`,
      { table: [render()], rowLabels: ["min coins"], colLabels: dp.map((_, i) => String(i)), cursor: [0, target], used, done: true },
      4,
    );
    return f.all;
  },
};

export const lisViz: VizAlgo = {
  slug: "lis",
  name: "Longest Increasing Subsequence",
  topic: "dp",
  kind: "array",
  difficulty: "Medium",
  tags: ["patience sorting", "binary search"],
  blurb: "Keep the smallest possible tail for each achievable length. Binary search replaces the inner loop and drops the cost to n log n.",
  complexity: { time: "O(n log n)", space: "O(n)", note: "The tails array is not the actual subsequence, only its length is meaningful." },
  pseudocode: [
    "tails = []",
    "for x in a:",
    "  i = first index with tails[i] >= x",
    "  if i == tails.length: tails.push(x)",
    "  else: tails[i] = x",
    "answer = tails.length",
  ],
  defaultInput: "10, 9, 2, 5, 3, 7, 101, 18",
  inputHint: "Comma separated numbers",
  related: ["longest-increasing-subsequence", "russian-doll-envelopes", "longest-bitonic-subsequence"],
  run(input) {
    const a = parseNums(input, [10, 9, 2, 5, 3, 7, 101, 18]);
    const f = new Frames();
    const tails: number[] = [];
    f.push("tails[k] will hold the smallest value that can end an increasing run of length k+1.", { arr: a, tails: [] }, 0);
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      let lo = 0, hi = tails.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (tails[mid] >= x) hi = mid;
        else lo = mid + 1;
      }
      if (lo === tails.length) {
        tails.push(x);
        f.push(`${x} is larger than every tail, so it extends the longest run to length ${tails.length}.`, { arr: a, tails: [...tails], compare: [i], appended: tails.length - 1 }, 3, { length: tails.length });
      } else {
        const old = tails[lo];
        tails[lo] = x;
        f.push(`${x} replaces ${old} at position ${lo}. Runs of length ${lo + 1} can now end on a smaller value, which leaves more room later.`, { arr: a, tails: [...tails], compare: [i], replaced: lo }, 4, { length: tails.length });
      }
    }
    f.push(`Longest increasing subsequence has length ${tails.length}.`, { arr: a, tails: [...tails], done: true }, 5, { length: tails.length });
    return f.all;
  },
};

export const gridDp: VizAlgo = {
  slug: "grid-dp",
  name: "Minimum Path Sum",
  topic: "dp",
  kind: "dptable",
  difficulty: "Medium",
  tags: ["grid", "dependency order"],
  blurb: "Movement is restricted to right and down, which fixes the dependency order: every cell needs the one above and the one to its left.",
  complexity: { time: "O(rows * cols)", space: "O(cols)", note: "Unique paths, maximal square and dungeon game are the same walk with different combine rules." },
  pseudocode: [
    "dp[0][0] = grid[0][0]",
    "for each cell in row-major order:",
    "  best = min(dp[r-1][c], dp[r][c-1])",
    "  dp[r][c] = grid[r][c] + best",
    "answer = dp[R-1][C-1]",
  ],
  defaultInput: "1 3 1\n1 5 1\n4 2 1",
  inputHint: "Rows of numbers separated by spaces",
  related: ["minimum-path-sum", "unique-paths", "maximal-square", "triangle"],
  run(input) {
    const grid = input
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x)));
    const g = grid.length && grid[0].length ? grid : [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
    const R = g.length, Cc = g[0].length;
    const f = new Frames();
    const dp: number[][] = Array.from({ length: R }, () => new Array(Cc).fill(0));
    const rowLabels = g.map((_, r) => `row ${r}`);
    const colLabels = g[0].map((_, c) => `col ${c}`);
    f.push("Each cell holds the cheapest cost of reaching it from the top left.", { table: dp.map((r) => [...r]), rowLabels, colLabels, source: g.map((r) => [...r]) }, 0);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cc; c++) {
        const deps: [number, number][] = [];
        let best = Infinity;
        if (r === 0 && c === 0) best = 0;
        if (r > 0) { best = Math.min(best, dp[r - 1][c]); deps.push([r - 1, c]); }
        if (c > 0) { best = Math.min(best, dp[r][c - 1]); deps.push([r, c - 1]); }
        dp[r][c] = g[r][c] + best;
        f.push(
          r === 0 && c === 0
            ? `Start cell costs ${g[0][0]}.`
            : `Cell (${r}, ${c}) costs ${g[r][c]} plus the cheaper arrival ${best}, giving ${dp[r][c]}.`,
          { table: dp.map((x) => [...x]), rowLabels, colLabels, cursor: [r, c], deps, source: g.map((x) => [...x]) },
          3,
        );
      }
    }
    // reconstruct path
    const path: [number, number][] = [];
    let r = R - 1, c = Cc - 1;
    while (r > 0 || c > 0) {
      path.push([r, c]);
      if (r === 0) c--;
      else if (c === 0) r--;
      else if (dp[r - 1][c] <= dp[r][c - 1]) r--;
      else c--;
    }
    path.push([0, 0]);
    f.push(`Cheapest path costs ${dp[R - 1][Cc - 1]}. Trace back through the smaller neighbour to recover the route.`, { table: dp.map((x) => [...x]), rowLabels, colLabels, cursor: [R - 1, Cc - 1], path, source: g.map((x) => [...x]), done: true }, 4);
    return f.all;
  },
};

export const editDistance: VizAlgo = {
  slug: "edit-distance",
  name: "Edit Distance",
  topic: "dp",
  kind: "dptable",
  difficulty: "Hard",
  tags: ["two sequences", "insert delete replace"],
  blurb: "Cheapest way to turn one string into another using insert, delete and replace. Each cell picks the cheapest of three neighbours.",
  complexity: { time: "O(n * m)", space: "O(m)", note: "This is the algorithm behind spell checkers, diff and DNA alignment." },
  pseudocode: [
    "dp[i][0] = i; dp[0][j] = j",
    "if a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1]",
    "else: dp[i][j] = 1 + min(",
    "  dp[i-1][j-1],  // replace",
    "  dp[i][j-1],    // insert",
    "  dp[i-1][j])    // delete",
  ],
  defaultInput: "horse | ros",
  inputHint: "source word | target word",
  related: ["edit-distance", "one-edit-distance", "distinct-subsequences"],
  run(input) {
    const [aPart, bPart] = splitOnPipe(input);
    const a = (aPart.trim() || "horse").slice(0, 9);
    const b = (bPart.trim() || "ros").slice(0, 9);
    const f = new Frames();
    const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    const rowLabels = ["-", ...a.split("")];
    const colLabels = ["-", ...b.split("")];
    f.push("Turning a prefix into an empty string costs one delete per character, which fills the first row and column.", { table: dp.map((r) => [...r]), rowLabels, colLabels }, 0);
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          f.push(`${a[i - 1]} already matches ${b[j - 1]}, so nothing to pay: carry ${dp[i][j]} from the diagonal.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [i, j], deps: [[i - 1, j - 1]], match: true }, 1);
        } else {
          const rep = dp[i - 1][j - 1], ins = dp[i][j - 1], del = dp[i - 1][j];
          dp[i][j] = 1 + Math.min(rep, ins, del);
          const which = rep <= ins && rep <= del ? "replace" : ins <= del ? "insert" : "delete";
          f.push(`${a[i - 1]} and ${b[j - 1]} differ. Replace costs ${rep}, insert ${ins}, delete ${del}. Cheapest is ${which}, so ${dp[i][j]}.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [i, j], deps: [[i - 1, j - 1], [i, j - 1], [i - 1, j]], op: which }, 2);
        }
      }
    }
    f.push(`Minimum edit distance is ${dp[a.length][b.length]}.`, { table: dp.map((r) => [...r]), rowLabels, colLabels, cursor: [a.length, b.length], done: true }, 5);
    return f.all;
  },
};

export const DP_ALGOS = [dpFib, knapsack, lcsViz, coinChange, lisViz, gridDp, editDistance];
export { parseWords };
