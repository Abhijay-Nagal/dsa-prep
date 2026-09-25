import type { Topic, TopicId } from "@/lib/types";

export const TOPICS: Topic[] = [
  { id: "arrays", name: "Arrays", icon: "Rows3", color: "#6d5efc", order: 1, interviewWeight: 0.95, prereq: [],
    blurb: "Contiguous memory, O(1) indexing. The substrate every other structure is built on.",
    keyIdeas: ["Index arithmetic and in-place swaps", "Scanning invariants", "Amortised growth of dynamic arrays", "Cache locality is why arrays beat lists in practice"] },
  { id: "strings", name: "Strings", icon: "Type", color: "#b15cff", order: 2, interviewWeight: 0.85, prereq: ["arrays"],
    blurb: "Arrays of characters with immutability quirks and a whole family of matching algorithms.",
    keyIdeas: ["Immutability makes naive concatenation quadratic", "Character frequency maps", "Palindromes expand from centres", "Pattern matching: KMP, Z, Rabin-Karp"] },
  { id: "hashing", name: "Hashing", icon: "Hash", color: "#34d3ff", order: 3, interviewWeight: 0.9, prereq: ["arrays"],
    blurb: "Trade memory for time. Turns most quadratic scans into a single linear pass.",
    keyIdeas: ["Average O(1) lookup, worst case O(n)", "Complement trick for pair sums", "Prefix sum plus map counts subarrays", "Grouping by a canonical key"] },
  { id: "sorting", name: "Sorting", icon: "ArrowDownWideNarrow", color: "#2fd48f", order: 4, interviewWeight: 0.7, prereq: ["arrays"],
    blurb: "A preprocessing step that unlocks two pointers, greedy and binary search.",
    keyIdeas: ["Comparison sorts bottom out at O(n log n)", "Counting and radix beat that on small key spaces", "Stability matters when sorting by multiple keys", "Custom comparators encode the greedy choice"] },
  { id: "binary-search", name: "Binary Search", icon: "Crosshair", color: "#ffb020", order: 5, interviewWeight: 0.8, prereq: ["arrays", "sorting"],
    blurb: "Halve the search space every step. Works on any monotonic predicate, not just sorted arrays.",
    keyIdeas: ["Search on the answer, not the array", "Find the boundary where the predicate flips", "Off-by-one lives in the lo, hi and mid updates", "Thirty steps is enough for a billion elements"] },
  { id: "two-pointers", name: "Two Pointers", icon: "MoveHorizontal", color: "#ff5f6d", order: 6, interviewWeight: 0.85, prereq: ["arrays", "sorting"],
    blurb: "Two indices moving under an invariant. Converts nested loops into one pass.",
    keyIdeas: ["Opposite ends for sorted pair problems", "Same direction for partitioning", "Fast and slow for cycles and midpoints", "Each pointer only moves forward, so O(n)"] },
  { id: "sliding-window", name: "Sliding Window", icon: "RectangleHorizontal", color: "#6d5efc", order: 7, interviewWeight: 0.8, prereq: ["two-pointers", "hashing"],
    blurb: "A contiguous range that grows on the right and shrinks on the left while a condition holds.",
    keyIdeas: ["Fixed size versus variable size windows", "Shrink while invalid, record while valid", "Monotonic deque for window extrema", "At most K minus at most K-1 gives exactly K"] },
  { id: "prefix-sum", name: "Prefix Sum", icon: "Sigma", color: "#34d3ff", order: 8, interviewWeight: 0.6, prereq: ["arrays", "hashing"],
    blurb: "Precompute cumulative aggregates so any range query becomes constant time.",
    keyIdeas: ["Range sum is P[r+1] minus P[l]", "Prefix XOR behaves the same way", "Difference arrays handle range updates", "2D prefix sums via inclusion and exclusion"] },
  { id: "matrix", name: "Matrix", icon: "Grid3x3", color: "#b15cff", order: 9, interviewWeight: 0.55, prereq: ["arrays"],
    blurb: "Two dimensional grids: traversal orders, rotations and in-place tricks.",
    keyIdeas: ["Transpose then reverse rotates by 90 degrees", "Layer by layer spiral traversal", "Use row zero and column zero as marker storage", "Flatten an index as r times cols plus c"] },
  { id: "intervals", name: "Intervals", icon: "GitCommitHorizontal", color: "#2fd48f", order: 10, interviewWeight: 0.6, prereq: ["sorting"],
    blurb: "Sort by start or end, then sweep. Covers merging, meeting rooms and scheduling.",
    keyIdeas: ["Two intervals overlap when each starts before the other ends", "Sort by end for maximum non-overlapping count", "Sweep line with plus one and minus one events", "A min heap of end times counts rooms"] },
  { id: "linked-list", name: "Linked List", icon: "Link2", color: "#ffb020", order: 11, interviewWeight: 0.7, prereq: ["arrays"],
    blurb: "Pointer surgery. Cheap inserts, no random access, and a favourite whiteboard test.",
    keyIdeas: ["A dummy head removes edge cases", "Fast and slow pointers find middle and cycles", "Reverse by rewiring three pointers", "Recursion mirrors the structure exactly"] },
  { id: "stack-queue", name: "Stacks & Queues", icon: "Layers", color: "#ff5f6d", order: 12, interviewWeight: 0.75, prereq: ["arrays", "linked-list"],
    blurb: "LIFO and FIFO. Monotonic variants crack the whole next-greater family.",
    keyIdeas: ["Matching and nesting problems are stack problems", "A monotonic stack gives next greater in linear time", "A deque tracks window extrema", "Two stacks simulate a queue in amortised O(1)"] },
  { id: "trees", name: "Trees", icon: "Network", color: "#6d5efc", order: 13, interviewWeight: 0.9, prereq: ["linked-list", "stack-queue"],
    blurb: "Recursive structure where almost every solution is solve the children, then combine.",
    keyIdeas: ["Pre, in and post order are one walk with different visit times", "BFS by level with a queue", "Return more than one value to the parent", "Height, diameter and path sums are all post-order"] },
  { id: "bst", name: "Binary Search Tree", icon: "GitFork", color: "#b15cff", order: 14, interviewWeight: 0.65, prereq: ["trees", "binary-search"],
    blurb: "Ordering invariant: left is smaller, right is larger. In-order traversal yields sorted output.",
    keyIdeas: ["Search, insert and delete in O(h)", "In-order gives a sorted sequence", "Validate with min and max bounds, not just children", "Balance is what keeps the height logarithmic"] },
  { id: "heap", name: "Heap / Priority Queue", icon: "Triangle", color: "#34d3ff", order: 15, interviewWeight: 0.7, prereq: ["trees", "arrays"],
    blurb: "Partially ordered complete tree that hands you the extreme element instantly.",
    keyIdeas: ["Array backed, children sit at 2i+1 and 2i+2", "Top K with a heap of size K", "Two heaps track a running median", "Heapify builds in linear time"] },
  { id: "graphs", name: "Graphs", icon: "Share2", color: "#2fd48f", order: 16, interviewWeight: 0.85, prereq: ["trees", "stack-queue", "heap"],
    blurb: "Nodes and edges. Most grid, dependency and network questions are graph questions in disguise.",
    keyIdeas: ["BFS gives shortest path on unweighted edges", "DFS for connectivity, cycles and ordering", "Dijkstra needs non-negative weights", "Union-Find answers connectivity incrementally"] },
  { id: "greedy", name: "Greedy", icon: "Zap", color: "#ffb020", order: 17, interviewWeight: 0.6, prereq: ["sorting", "intervals"],
    blurb: "Take the locally best option and prove it never hurts. Short code, hard proofs.",
    keyIdeas: ["An exchange argument justifies the choice", "Sorting usually reveals the greedy order", "Counterexample hunting is the debugging tool", "When greedy fails, the answer is usually DP"] },
  { id: "dp", name: "Dynamic Programming", icon: "Boxes", color: "#ff5f6d", order: 18, interviewWeight: 0.9, prereq: ["backtracking", "arrays"],
    blurb: "Overlapping subproblems plus optimal substructure. Write the recursion, then cache it.",
    keyIdeas: ["State is what you must know to decide next", "Memoise top down, then flip to bottom up", "Space optimise by keeping only the rows you read", "Families: knapsack, LIS, LCS, grid, interval, bitmask"] },
  { id: "backtracking", name: "Recursion & Backtracking", icon: "GitBranch", color: "#6d5efc", order: 19, interviewWeight: 0.75, prereq: ["arrays"],
    blurb: "Build a candidate, recurse, undo. The brute force that all DP is an optimisation of.",
    keyIdeas: ["Choose, explore, un-choose", "Prune early, that is the whole game", "Draw the recursion tree before coding", "For duplicates, sort then skip equal siblings"] },
  { id: "tries", name: "Tries", icon: "TextSearch", color: "#b15cff", order: 20, interviewWeight: 0.45, prereq: ["trees", "strings"],
    blurb: "Prefix tree that makes autocomplete, dictionary and XOR maximisation problems linear.",
    keyIdeas: ["Each node is one character edge", "Search cost depends on word length, not dictionary size", "A bitwise trie solves the max XOR pair", "Store counts to support deletion"] },
  { id: "bit-manipulation", name: "Bit Manipulation", icon: "Binary", color: "#34d3ff", order: 21, interviewWeight: 0.5, prereq: ["math"],
    blurb: "Integers as bit vectors. Sets in 32 bits, XOR tricks and subset enumeration.",
    keyIdeas: ["x AND x-1 clears the lowest set bit", "A value XOR itself is zero, so XOR pairs things off", "1 shifted left by k builds subset masks", "Submask enumeration walks s = (s-1) AND m"] },
  { id: "math", name: "Math & Number Theory", icon: "Calculator", color: "#2fd48f", order: 22, interviewWeight: 0.5, prereq: [],
    blurb: "Primes, GCD, modular arithmetic, combinatorics and the overflow traps around them.",
    keyIdeas: ["Sieve of Eratosthenes marks composites fast", "Euclid reduces gcd(a,b) to gcd(b, a mod b)", "Fast exponentiation squares its way to the answer", "Watch integer overflow and negative modulo"] },
  { id: "design", name: "Design (LLD)", icon: "Blocks", color: "#ffb020", order: 23, interviewWeight: 0.55, prereq: ["hashing", "linked-list", "heap"],
    blurb: "Compose primitives into a structure that hits required time bounds. The bridge to system design.",
    keyIdeas: ["Hash map plus doubly linked list gives O(1) LRU", "Buckets of equal frequency give LFU", "Randomised O(1) needs an array and an index map", "State the invariants before writing methods"] },
  { id: "advanced", name: "Advanced", icon: "Sparkles", color: "#ff5f6d", order: 24, interviewWeight: 0.3, prereq: ["graphs", "dp", "trees"],
    blurb: "Segment trees, Fenwick, LCA and SCC. Rare in SDE loops, decisive in competitive rounds.",
    keyIdeas: ["Segment tree: log time range query and point update", "Fenwick is the compact prefix sum cousin", "Binary lifting answers LCA in log time", "Tarjan and Kosaraju find strongly connected components"] },
];

export const TOPIC_MAP: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
export const topicName = (id: string) => TOPIC_MAP[id]?.name ?? id;
export const topicColor = (id: string) => TOPIC_MAP[id]?.color ?? "#6d5efc";

/** Learning-path order resolved from prerequisites (stable topological sort). */
export function topicPath(): TopicId[] {
  const done = new Set<TopicId>();
  const out: TopicId[] = [];
  const sorted = [...TOPICS].sort((a, b) => a.order - b.order);
  let guard = 0;
  while (out.length < sorted.length && guard++ < 200) {
    for (const t of sorted) {
      if (done.has(t.id)) continue;
      if (t.prereq.every((p) => done.has(p))) {
        done.add(t.id);
        out.push(t.id);
      }
    }
  }
  for (const t of sorted) if (!done.has(t.id)) out.push(t.id);
  return out;
}
