import type { VizAlgo } from "@/lib/types";
import { C, Frames, parseNums, splitOnPipe } from "./util";

interface TNode {
  id: number;
  val: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
  depth: number;
}

/** Build a binary tree from level order values and lay it out for drawing. */
function buildTree(vals: number[]): TNode[] {
  const nodes: TNode[] = vals.map((v, i) => ({ id: i, val: v, left: null, right: null, x: 0, y: 0, depth: 0 }));
  for (let i = 0; i < nodes.length; i++) {
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < nodes.length) nodes[i].left = l;
    if (r < nodes.length) nodes[i].right = r;
  }
  layout(nodes);
  return nodes;
}

/** In-order x placement keeps edges from crossing. */
function layout(nodes: TNode[]) {
  if (!nodes.length) return;
  let counter = 0;
  let maxDepth = 0;
  const walk = (id: number | null, depth: number) => {
    if (id === null) return;
    walk(nodes[id].left, depth + 1);
    nodes[id].x = counter++;
    nodes[id].depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    walk(nodes[id].right, depth + 1);
  };
  walk(0, 0);
  const span = Math.max(1, counter - 1);
  for (const n of nodes) {
    n.x = 8 + (n.x / span) * 84;
    n.y = maxDepth === 0 ? 50 : 12 + (n.depth / maxDepth) * 74;
  }
}

const drawable = (nodes: TNode[]) =>
  nodes.map((n) => ({ id: n.id, val: n.val, x: n.x, y: n.y, left: n.left, right: n.right }));

export const treeTraversal: VizAlgo = {
  slug: "tree-traversal",
  name: "Tree Traversals (Pre / In / Post)",
  topic: "trees",
  kind: "tree",
  difficulty: "Easy",
  tags: ["recursion", "DFS"],
  blurb:
    "One depth first walk, three visit times. Pre-order records on the way in, in-order between the children, post-order on the way out.",
  complexity: { time: "O(n)", space: "O(h) for the call stack", note: "In-order on a BST emits sorted values. Post-order is what you need when a node depends on its children." },
  pseudocode: [
    "dfs(node):",
    "  if node is null: return",
    "  visit(node)        // pre-order",
    "  dfs(node.left)",
    "  visit(node)        // in-order",
    "  dfs(node.right)",
    "  visit(node)        // post-order",
  ],
  defaultInput: "5, 3, 8, 1, 4, 7, 9",
  inputHint: "Level order values",
  related: ["binary-tree-inorder-traversal", "binary-tree-preorder-traversal", "morris-inorder-traversal"],
  run(input) {
    const nodes = buildTree(parseNums(input, [5, 3, 8, 1, 4, 7, 9]));
    const f = new Frames();
    const pre: number[] = [], ino: number[] = [], post: number[] = [];
    const color: Record<number, string> = {};
    const stack: number[] = [];
    f.push("The same traversal produces three different orders depending on when you record the node.", { nodes: drawable(nodes), color: {}, pre: [], ino: [], post: [], stack: [] }, 0);
    const dfs = (id: number | null) => {
      if (id === null) return;
      stack.push(id);
      color[id] = C.active;
      pre.push(nodes[id].val);
      f.push(`Enter ${nodes[id].val}. Pre-order records it now.`, { nodes: drawable(nodes), color: { ...color }, pre: [...pre], ino: [...ino], post: [...post], stack: [...stack], current: id, phase: "pre" }, 3);
      dfs(nodes[id].left);
      ino.push(nodes[id].val);
      f.push(`Left subtree of ${nodes[id].val} is done. In-order records it now.`, { nodes: drawable(nodes), color: { ...color }, pre: [...pre], ino: [...ino], post: [...post], stack: [...stack], current: id, phase: "in" }, 5);
      dfs(nodes[id].right);
      post.push(nodes[id].val);
      color[id] = C.done;
      stack.pop();
      f.push(`Both subtrees of ${nodes[id].val} are done. Post-order records it now.`, { nodes: drawable(nodes), color: { ...color }, pre: [...pre], ino: [...ino], post: [...post], stack: [...stack], current: id, phase: "post" }, 7);
    };
    dfs(0);
    f.push(`Pre: ${pre.join(" ")}  |  In: ${ino.join(" ")}  |  Post: ${post.join(" ")}`, { nodes: drawable(nodes), color, pre, ino, post, stack: [], done: true }, 7);
    return f.all;
  },
};

export const treeBfs: VizAlgo = {
  slug: "tree-bfs",
  name: "Level Order Traversal",
  topic: "trees",
  kind: "tree",
  difficulty: "Medium",
  tags: ["queue", "BFS"],
  blurb: "Process the queue one full level at a time by snapshotting its length before the inner loop.",
  complexity: { time: "O(n)", space: "O(width)", note: "This single trick powers right side view, zigzag, minimum depth and average of levels." },
  pseudocode: [
    "queue = [root]",
    "while queue:",
    "  size = queue.length      // snapshot one level",
    "  for i in 0..size-1:",
    "    node = queue.pop_front()",
    "    push node.left and node.right",
  ],
  defaultInput: "3, 9, 20, 1, 2, 15, 7",
  inputHint: "Level order values",
  related: ["binary-tree-level-order-traversal", "binary-tree-right-side-view", "binary-tree-zigzag-level-order-traversal"],
  run(input) {
    const nodes = buildTree(parseNums(input, [3, 9, 20, 1, 2, 15, 7]));
    const f = new Frames();
    const color: Record<number, string> = {};
    const levels: number[][] = [];
    const queue: number[] = [0];
    color[0] = C.frontier;
    f.push("Put the root in the queue.", { nodes: drawable(nodes), color: { ...color }, queue: [...queue], levels: [] }, 0);
    while (queue.length) {
      const size = queue.length;
      const level: number[] = [];
      f.push(`The queue holds exactly one level: ${size} node${size === 1 ? "" : "s"}. Snapshot that size.`, { nodes: drawable(nodes), color: { ...color }, queue: [...queue], levels: levels.map((l) => [...l]), levelSize: size }, 2);
      for (let i = 0; i < size; i++) {
        const id = queue.shift()!;
        color[id] = C.visited;
        level.push(nodes[id].val);
        const kids = [nodes[id].left, nodes[id].right].filter((x): x is number => x !== null);
        for (const k of kids) { queue.push(k); color[k] = C.frontier; }
        f.push(`Visit ${nodes[id].val}${kids.length ? `, enqueue ${kids.map((k) => nodes[k].val).join(" and ")}` : ""}.`, { nodes: drawable(nodes), color: { ...color }, queue: [...queue], levels: [...levels.map((l) => [...l]), [...level]], current: id }, 5);
      }
      levels.push(level);
      f.push(`Level ${levels.length} complete: ${level.join(", ")}. Rightmost node is ${level[level.length - 1]}.`, { nodes: drawable(nodes), color: { ...color }, queue: [...queue], levels: levels.map((l) => [...l]) }, 5);
    }
    f.push(`Levels: ${levels.map((l) => `[${l.join(",")}]`).join(" ")}`, { nodes: drawable(nodes), color, queue: [], levels, done: true }, 5);
    return f.all;
  },
};

export const bstOperations: VizAlgo = {
  slug: "bst-operations",
  name: "BST Insert & Search",
  topic: "bst",
  kind: "tree",
  difficulty: "Medium",
  tags: ["ordering invariant", "logarithmic"],
  blurb: "Left is smaller, right is larger. That one rule turns search, insert and delete into a single walk down the tree.",
  complexity: { time: "O(h), which is O(log n) when balanced", space: "O(1) iterative", note: "Inserting sorted data degrades the tree into a linked list. That is why self-balancing trees exist." },
  pseudocode: [
    "insert(node, v):",
    "  if node is null: return new Node(v)",
    "  if v < node.val: node.left = insert(node.left, v)",
    "  else: node.right = insert(node.right, v)",
    "search(node, v): same walk, compare and descend",
  ],
  defaultInput: "50, 30, 70, 20, 40, 60, 80 | 40",
  inputHint: "values to insert | value to search",
  related: ["validate-binary-search-tree", "insert-into-a-binary-search-tree", "search-in-a-binary-search-tree", "delete-node-in-a-bst"],
  run(input) {
    const [insertPart, searchPart] = splitOnPipe(input);
    const vals = parseNums(insertPart, [50, 30, 70, 20, 40, 60, 80]);
    const f = new Frames();
    const nodes: TNode[] = [];

    const insert = (v: number) => {
      if (!nodes.length) {
        nodes.push({ id: 0, val: v, left: null, right: null, x: 0, y: 0, depth: 0 });
        layout(nodes);
        f.push(`${v} becomes the root.`, { nodes: drawable(nodes), color: {}, inserting: v }, 1);
        return;
      }
      let cur = 0;
      const path: number[] = [];
      while (true) {
        path.push(cur);
        const c: Record<number, string> = {};
        for (const p of path) c[p] = C.frontier;
        c[cur] = C.active;
        f.push(`Inserting ${v}: at node ${nodes[cur].val}, go ${v < nodes[cur].val ? "left" : "right"}.`, { nodes: drawable(nodes), color: c, inserting: v, path: [...path] }, v < nodes[cur].val ? 2 : 3);
        if (v < nodes[cur].val) {
          if (nodes[cur].left === null) {
            nodes.push({ id: nodes.length, val: v, left: null, right: null, x: 0, y: 0, depth: 0 });
            nodes[cur].left = nodes.length - 1;
            break;
          }
          cur = nodes[cur].left!;
        } else {
          if (nodes[cur].right === null) {
            nodes.push({ id: nodes.length, val: v, left: null, right: null, x: 0, y: 0, depth: 0 });
            nodes[cur].right = nodes.length - 1;
            break;
          }
          cur = nodes[cur].right!;
        }
      }
      layout(nodes);
      f.push(`Empty slot found, so ${v} is placed there.`, { nodes: drawable(nodes), color: { [nodes.length - 1]: C.done }, inserting: v }, 1);
    };

    for (const v of vals) insert(v);
    f.push("Tree built. An in-order walk of this tree emits the values in sorted order.", { nodes: drawable(nodes), color: {} }, 0);

    const target = parseNums(searchPart, [vals[Math.floor(vals.length / 2)]])[0];
    let cur: number | null = 0;
    const path: number[] = [];
    f.set("steps", 0);
    while (cur !== null) {
      path.push(cur);
      f.bump("steps");
      const c: Record<number, string> = {};
      for (const p of path) c[p] = C.frontier;
      c[cur] = C.active;
      if (nodes[cur].val === target) {
        c[cur] = C.done;
        f.push(`Found ${target} after ${f.count.steps} comparison${f.count.steps === 1 ? "" : "s"}. A linear scan would have taken up to ${nodes.length}.`, { nodes: drawable(nodes), color: c, searching: target, path: [...path], found: cur }, 4);
        return f.all;
      }
      const goLeft: boolean = target < nodes[cur as number].val;
      const skipped = countSubtree(nodes, goLeft ? nodes[cur].right : nodes[cur].left);
      f.push(`${target} is ${goLeft ? "below" : "above"} ${nodes[cur].val}, so go ${goLeft ? "left" : "right"} and discard ${skipped} node${skipped === 1 ? "" : "s"} on the other side.`, { nodes: drawable(nodes), color: c, searching: target, path: [...path] }, 4);
      cur = goLeft ? nodes[cur].left : nodes[cur].right;
    }
    f.push(`${target} is not in the tree.`, { nodes: drawable(nodes), color: {}, searching: target, path }, 4);
    return f.all;
  },
};

function countSubtree(nodes: TNode[], id: number | null): number {
  if (id === null) return 0;
  return 1 + countSubtree(nodes, nodes[id].left) + countSubtree(nodes, nodes[id].right);
}

export const validateBst: VizAlgo = {
  slug: "validate-bst",
  name: "Validate a BST",
  topic: "bst",
  kind: "tree",
  difficulty: "Medium",
  tags: ["bounds", "recursion"],
  blurb: "Checking a node against its direct children is not enough. Pass an allowed range down the tree and narrow it at each step.",
  complexity: { time: "O(n)", space: "O(h)", note: "The classic wrong answer passes this tree: 10 with left child 5 whose right child is 12." },
  pseudocode: [
    "valid(node, low, high):",
    "  if node is null: return true",
    "  if node.val <= low or node.val >= high: return false",
    "  return valid(node.left, low, node.val)",
    "     and valid(node.right, node.val, high)",
  ],
  defaultInput: "10, 5, 15, 1, 12, 13, 20",
  inputHint: "Level order values",
  related: ["validate-binary-search-tree", "recover-binary-search-tree", "largest-bst-in-a-binary-tree"],
  run(input) {
    const nodes = buildTree(parseNums(input, [10, 5, 15, 1, 12, 13, 20]));
    const f = new Frames();
    const color: Record<number, string> = {};
    const bounds: Record<number, string> = {};
    let ok = true;
    f.push("Every node must fit inside a window set by its ancestors, not just its parent.", { nodes: drawable(nodes), color: {}, bounds: {} }, 0);
    const walk = (id: number | null, low: number, high: number): boolean => {
      if (id === null) return true;
      const lo = low === -Infinity ? "-inf" : String(low);
      const hi = high === Infinity ? "+inf" : String(high);
      bounds[id] = `(${lo}, ${hi})`;
      color[id] = C.active;
      f.push(`Node ${nodes[id].val} must lie strictly inside (${lo}, ${hi}).`, { nodes: drawable(nodes), color: { ...color }, bounds: { ...bounds }, current: id }, 2);
      if (nodes[id].val <= low || nodes[id].val >= high) {
        color[id] = C.swap;
        ok = false;
        f.push(`${nodes[id].val} violates that window, so this is not a valid BST.`, { nodes: drawable(nodes), color: { ...color }, bounds: { ...bounds }, current: id, invalid: id }, 2);
        return false;
      }
      color[id] = C.done;
      return walk(nodes[id].left, low, nodes[id].val) && walk(nodes[id].right, nodes[id].val, high);
    };
    walk(0, -Infinity, Infinity);
    f.push(ok ? "Every node fits its window. This is a valid BST." : "At least one node broke its window, so the tree is not a BST.", { nodes: drawable(nodes), color, bounds, done: true, valid: ok }, 4);
    return f.all;
  },
};

export const heapOps: VizAlgo = {
  slug: "heap-ops",
  name: "Heap: Push and Pop",
  topic: "heap",
  kind: "tree",
  difficulty: "Medium",
  tags: ["priority queue", "sift up", "sift down"],
  blurb: "A complete binary tree stored in an array. Push sifts the new value up, pop moves the last value to the root and sifts it down.",
  complexity: { time: "O(log n) per operation", space: "O(n)", note: "Children of index i sit at 2i+1 and 2i+2, so no pointers are needed." },
  pseudocode: [
    "push(v): append v, then",
    "  while v < parent: swap up",
    "pop(): save root, move last element to root, then",
    "  while a child is smaller: swap down with the smaller child",
  ],
  defaultInput: "5, 3, 8, 1, 9, 2",
  inputHint: "Values to push into a min heap",
  related: ["kth-largest-element-in-an-array", "implement-heap", "merge-k-sorted-lists"],
  run(input) {
    const vals = parseNums(input, [5, 3, 8, 1, 9, 2]);
    const heap: number[] = [];
    const f = new Frames();
    const toNodes = () => {
      return drawable(buildTree(heap));
    };
    f.push("A min heap: every parent is at most its children.", { nodes: [], color: {}, array: [] }, 0);
    for (const v of vals) {
      heap.push(v);
      let i = heap.length - 1;
      f.push(`Push ${v} at the end of the array, which is the next free leaf.`, { nodes: toNodes(), color: { [i]: C.active }, array: [...heap] }, 0);
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p] <= heap[i]) {
          f.push(`Parent ${heap[p]} is already smaller, so the heap property holds.`, { nodes: toNodes(), color: { [i]: C.done, [p]: C.compare }, array: [...heap] }, 1);
          break;
        }
        f.push(`Parent ${heap[p]} is larger than ${heap[i]}, so swap them upward.`, { nodes: toNodes(), color: { [i]: C.swap, [p]: C.swap }, array: [...heap] }, 1);
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    }
    f.push(`Heap built. The minimum ${heap[0]} sits at the root.`, { nodes: toNodes(), color: { 0: C.best }, array: [...heap] }, 1);

    const popped: number[] = [];
    while (heap.length) {
      const top = heap[0];
      popped.push(top);
      const last = heap.pop()!;
      if (heap.length) {
        heap[0] = last;
        f.push(`Pop ${top}. Move the last value ${last} to the root, then sift it down.`, { nodes: toNodes(), color: { 0: C.active }, array: [...heap], popped: [...popped] }, 2);
        let i = 0;
        while (true) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let small = i;
          if (l < heap.length && heap[l] < heap[small]) small = l;
          if (r < heap.length && heap[r] < heap[small]) small = r;
          if (small === i) break;
          f.push(`Child ${heap[small]} is smaller, so sink ${heap[i]}.`, { nodes: toNodes(), color: { [i]: C.swap, [small]: C.swap }, array: [...heap], popped: [...popped] }, 4);
          [heap[i], heap[small]] = [heap[small], heap[i]];
          i = small;
        }
      } else {
        f.push(`Pop ${top}. The heap is now empty.`, { nodes: [], color: {}, array: [], popped: [...popped] }, 2);
      }
    }
    f.push(`Popping repeatedly emits sorted order: ${popped.join(", ")}. That is heap sort.`, { nodes: [], color: {}, array: [], popped, done: true }, 4);
    return f.all;
  },
};

export const TREE_ALGOS = [treeTraversal, treeBfs, bstOperations, validateBst, heapOps];
