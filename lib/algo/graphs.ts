import type { VizAlgo } from "@/lib/types";
import { C, Frames, circleLayout, nodeCountFromEdges, parseEdges, splitOnPipe } from "./util";

interface GraphBase {
  nodes: { id: number; label: string; x: number; y: number }[];
  edges: { u: number; v: number; w: number; directed?: boolean }[];
}

function buildGraph(edgeStr: string, directed = false, fallback = "0-1,0-2,1-3,2-4,3-5,4-5"): GraphBase {
  const edges = parseEdges(edgeStr.trim() ? edgeStr : fallback);
  const n = Math.max(2, nodeCountFromEdges(edges));
  const pos = circleLayout(n);
  return {
    nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i), x: pos[i].x, y: pos[i].y })),
    edges: edges.map((e) => ({ ...e, directed })),
  };
}

const adjacency = (n: number, edges: { u: number; v: number; w: number }[], directed: boolean) => {
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    if (!directed) adj[e.v].push({ to: e.u, w: e.w });
  }
  for (const list of adj) list.sort((a, b) => a.to - b.to);
  return adj;
};

export const graphBfs: VizAlgo = {
  slug: "graph-bfs",
  name: "Breadth First Search",
  topic: "graphs",
  kind: "graph",
  difficulty: "Medium",
  tags: ["queue", "shortest path", "unweighted"],
  blurb: "Explore in rings of increasing distance. The first time BFS reaches a node, it arrived by a shortest path.",
  complexity: { time: "O(V + E)", space: "O(V)", note: "Mark nodes visited when you enqueue them, not when you dequeue, or they enter the queue twice." },
  pseudocode: [
    "queue = [start]; dist[start] = 0",
    "while queue not empty:",
    "  u = queue.pop_front()",
    "  for v in adj[u]:",
    "    if v not visited:",
    "      dist[v] = dist[u] + 1; queue.push(v)",
  ],
  defaultInput: "0-1,0-2,1-3,2-4,3-5,4-5,1-4 | 0",
  inputHint: "edges like 0-1,1-2 | start node",
  related: ["number-of-islands", "rotting-oranges", "word-ladder", "01-matrix"],
  run(input) {
    const [edgeStr, startStr] = splitOnPipe(input);
    const g = buildGraph(edgeStr);
    const start = Math.max(0, Math.min(g.nodes.length - 1, parseInt(startStr) || 0));
    const adj = adjacency(g.nodes.length, g.edges, false);
    const f = new Frames();
    const dist: Record<number, number> = { [start]: 0 };
    const parent: Record<number, number> = {};
    const queue = [start];
    const nodeColor: Record<number, string> = { [start]: C.frontier };
    const edgeColor: Record<string, string> = {};
    f.push(`Start BFS at node ${start}. Distance to itself is 0.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: {}, queue: [...queue], dist: { ...dist } }, 0);
    while (queue.length) {
      const u = queue.shift()!;
      nodeColor[u] = C.visited;
      f.bump("dequeued");
      f.push(`Dequeue node ${u}, at distance ${dist[u]}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, queue: [...queue], dist: { ...dist }, current: u }, 2);
      for (const { to: v } of adj[u]) {
        if (dist[v] === undefined) {
          dist[v] = dist[u] + 1;
          parent[v] = u;
          queue.push(v);
          nodeColor[v] = C.frontier;
          edgeColor[`${Math.min(u, v)}-${Math.max(u, v)}`] = C.active;
          f.push(`Node ${v} is new. It sits at distance ${dist[v]} via node ${u}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, queue: [...queue], dist: { ...dist }, current: u }, 5);
        } else {
          f.push(`Node ${v} is already known at distance ${dist[v]}, so skip it.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, queue: [...queue], dist: { ...dist }, current: u, skip: v }, 4);
        }
      }
    }
    f.push(`Every reachable node has its shortest distance from ${start}.`, { ...g, nodeColor, edgeColor, queue: [], dist, done: true }, 5);
    return f.all;
  },
};

export const graphDfs: VizAlgo = {
  slug: "graph-dfs",
  name: "Depth First Search",
  topic: "graphs",
  kind: "graph",
  difficulty: "Medium",
  tags: ["recursion", "connectivity"],
  blurb: "Follow one branch as deep as it goes, then backtrack. Each fresh launch from an unvisited node is one connected component.",
  complexity: { time: "O(V + E)", space: "O(V) recursion depth", note: "DFS answers connectivity, cycles and ordering. It does not give shortest paths." },
  pseudocode: [
    "dfs(u):",
    "  visit(u)",
    "  for v in adj[u]:",
    "    if v not visited: dfs(v)",
    "for each node: if not visited: dfs(node)  // counts components",
  ],
  defaultInput: "0-1,0-2,1-3,2-4,5-6 | 0",
  inputHint: "edges like 0-1,1-2 | start node",
  related: ["number-of-islands", "clone-graph", "surrounded-regions", "pacific-atlantic-water-flow"],
  run(input) {
    const [edgeStr, startStr] = splitOnPipe(input);
    const g = buildGraph(edgeStr, false, "0-1,0-2,1-3,2-4,5-6");
    const start = Math.max(0, Math.min(g.nodes.length - 1, parseInt(startStr) || 0));
    const adj = adjacency(g.nodes.length, g.edges, false);
    const f = new Frames();
    const visited = new Set<number>();
    const nodeColor: Record<number, string> = {};
    const edgeColor: Record<string, string> = {};
    const stack: number[] = [];
    let components = 0;
    f.set("components", 0);
    f.push("Depth first: go as deep as possible before backing up.", { ...g, nodeColor: {}, edgeColor: {}, stack: [] }, 0);

    const dfs = (u: number, from?: number) => {
      visited.add(u);
      stack.push(u);
      nodeColor[u] = C.active;
      if (from !== undefined) edgeColor[`${Math.min(from, u)}-${Math.max(from, u)}`] = C.path;
      f.push(`Visit node ${u}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, stack: [...stack], current: u }, 1);
      for (const { to: v } of adj[u]) {
        if (!visited.has(v)) {
          f.push(`Node ${v} is unvisited, recurse into it.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, stack: [...stack], current: u }, 3);
          dfs(v, u);
        }
      }
      nodeColor[u] = C.visited;
      stack.pop();
      f.push(`Node ${u} has no unvisited neighbours left. Backtrack.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, stack: [...stack], current: u, backtrack: true }, 3);
    };

    const order = [start, ...g.nodes.map((n) => n.id)];
    for (const s of order) {
      if (visited.has(s)) continue;
      components++;
      f.bump("components");
      f.push(`Node ${s} has not been reached yet, so this starts component ${components}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, stack: [] }, 4);
      dfs(s);
    }
    f.push(`Traversal complete. The graph has ${components} connected component${components === 1 ? "" : "s"}.`, { ...g, nodeColor, edgeColor, stack: [], done: true }, 4);
    return f.all;
  },
};

export const dijkstra: VizAlgo = {
  slug: "dijkstra",
  name: "Dijkstra Shortest Path",
  topic: "graphs",
  kind: "graph",
  difficulty: "Hard",
  tags: ["priority queue", "greedy", "weighted"],
  blurb: "Always finalise the closest unfinished node, then relax its outgoing edges. Requires non-negative weights.",
  complexity: { time: "O(E log V)", space: "O(V)", note: "The greedy argument breaks with negative edges, where you need Bellman-Ford." },
  pseudocode: [
    "dist[src] = 0; pq = {(0, src)}",
    "while pq:",
    "  (d, u) = pq.pop_min()",
    "  if d > dist[u]: continue",
    "  for (v, w) in adj[u]:",
    "    if d + w < dist[v]: dist[v] = d + w; pq.push((dist[v], v))",
  ],
  defaultInput: "0-1:4,0-2:1,2-1:2,1-3:5,2-3:8,3-4:3 | 0",
  inputHint: "weighted edges u-v:w | source",
  related: ["network-delay-time", "cheapest-flights-within-k-stops", "path-with-minimum-effort", "swim-in-rising-water"],
  run(input) {
    const [edgeStr, srcStr] = splitOnPipe(input);
    const g = buildGraph(edgeStr, false, "0-1:4,0-2:1,2-1:2,1-3:5,2-3:8,3-4:3");
    const src = Math.max(0, Math.min(g.nodes.length - 1, parseInt(srcStr) || 0));
    const adj = adjacency(g.nodes.length, g.edges, false);
    const f = new Frames();
    const INF = Infinity;
    const dist = new Array(g.nodes.length).fill(INF);
    dist[src] = 0;
    const settled = new Set<number>();
    const nodeColor: Record<number, string> = { [src]: C.frontier };
    const edgeColor: Record<string, string> = {};
    const pq: [number, number][] = [[0, src]];
    const showDist = () => Object.fromEntries(dist.map((d, i) => [i, d === INF ? "inf" : d]));
    f.push(`Source is ${src}. Everything else starts at infinity.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: {}, dist: showDist(), pq: [...pq] }, 0);

    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (settled.has(u)) {
        f.push(`Node ${u} was already settled with a shorter distance, so this stale entry is skipped.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, dist: showDist(), pq: [...pq] }, 3);
        continue;
      }
      settled.add(u);
      nodeColor[u] = C.visited;
      f.bump("settled");
      f.push(`Node ${u} is the closest unfinished node at distance ${d}. That distance is now final.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, dist: showDist(), pq: [...pq], current: u }, 2);
      for (const { to: v, w } of adj[u]) {
        f.bump("relaxations");
        const cand = d + w;
        if (cand < dist[v]) {
          const old = dist[v];
          dist[v] = cand;
          pq.push([cand, v]);
          if (!settled.has(v)) nodeColor[v] = C.frontier;
          edgeColor[`${Math.min(u, v)}-${Math.max(u, v)}`] = C.active;
          f.push(`Going through ${u} reaches ${v} at cost ${cand}, better than ${old === INF ? "infinity" : old}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, dist: showDist(), pq: [...pq], current: u, relaxed: v }, 5);
        } else {
          f.push(`Reaching ${v} through ${u} costs ${cand}, which is no better than ${dist[v]}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, dist: showDist(), pq: [...pq], current: u, skip: v }, 5);
        }
      }
    }
    f.push("All reachable nodes have final shortest distances.", { ...g, nodeColor, edgeColor, dist: showDist(), pq: [], done: true }, 5);
    return f.all;
  },
};

export const topologicalSort: VizAlgo = {
  slug: "topological-sort",
  name: "Topological Sort (Kahn)",
  topic: "graphs",
  kind: "graph",
  difficulty: "Medium",
  tags: ["indegree", "DAG", "cycle detection"],
  blurb: "Repeatedly take any node with no remaining prerequisites. If you cannot empty the graph, there is a cycle.",
  complexity: { time: "O(V + E)", space: "O(V)", note: "The produced order being shorter than the node count is exactly the cycle test." },
  pseudocode: [
    "compute indegree for every node",
    "queue = all nodes with indegree 0",
    "while queue:",
    "  u = queue.pop(); order.push(u)",
    "  for v in adj[u]: if --indegree[v] == 0: queue.push(v)",
    "if order.length < V: there is a cycle",
  ],
  defaultInput: "0-1,0-2,1-3,2-3,3-4",
  inputHint: "directed edges u-v (u must come before v)",
  related: ["course-schedule", "course-schedule-ii", "alien-dictionary"],
  run(input) {
    const g = buildGraph(input, true, "0-1,0-2,1-3,2-3,3-4");
    const n = g.nodes.length;
    const adj = adjacency(n, g.edges, true);
    const f = new Frames();
    const indeg = new Array(n).fill(0);
    for (const e of g.edges) indeg[e.v]++;
    const nodeColor: Record<number, string> = {};
    const edgeColor: Record<string, string> = {};
    const queue = g.nodes.filter((nd) => indeg[nd.id] === 0).map((nd) => nd.id);
    for (const q of queue) nodeColor[q] = C.frontier;
    const order: number[] = [];
    f.push(`Indegrees counted. Nodes ${queue.join(", ") || "(none)"} have no prerequisites.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: {}, indeg: [...indeg], queue: [...queue], order: [] }, 1);
    while (queue.length) {
      const u = queue.shift()!;
      order.push(u);
      nodeColor[u] = C.visited;
      f.push(`Take node ${u}. It is next in a valid order.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, indeg: [...indeg], queue: [...queue], order: [...order], current: u }, 3);
      for (const { to: v } of adj[u]) {
        indeg[v]--;
        edgeColor[`${u}-${v}`] = C.path;
        if (indeg[v] === 0) {
          queue.push(v);
          nodeColor[v] = C.frontier;
          f.push(`Node ${v} has no prerequisites left, so it is ready.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, indeg: [...indeg], queue: [...queue], order: [...order], current: u }, 4);
        } else {
          f.push(`Node ${v} still needs ${indeg[v]} more prerequisite${indeg[v] === 1 ? "" : "s"}.`, { ...g, nodeColor: { ...nodeColor }, edgeColor: { ...edgeColor }, indeg: [...indeg], queue: [...queue], order: [...order], current: u }, 4);
        }
      }
    }
    f.push(
      order.length === n
        ? `Valid order: ${order.join(" -> ")}.`
        : `Only ${order.length} of ${n} nodes could be ordered, so the graph contains a cycle.`,
      { ...g, nodeColor, edgeColor, indeg, queue: [], order, cycle: order.length !== n },
      5,
    );
    return f.all;
  },
};

export const unionFind: VizAlgo = {
  slug: "union-find",
  name: "Union-Find (DSU)",
  topic: "graphs",
  kind: "graph",
  difficulty: "Medium",
  tags: ["disjoint set", "path compression", "near constant"],
  blurb: "Each set keeps one representative. Union links two roots, find walks up to the root and flattens the path behind it.",
  complexity: { time: "Near O(1) amortised per operation", space: "O(n)", note: "Union by size plus path compression keeps trees almost flat." },
  pseudocode: [
    "find(x): while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]",
    "union(a, b):",
    "  ra = find(a); rb = find(b)",
    "  if ra == rb: this edge closes a cycle",
    "  attach the smaller tree under the larger",
  ],
  defaultInput: "0-1,2-3,1-2,4-5,3-4,0-5",
  inputHint: "edges processed in order",
  related: ["redundant-connection", "number-of-provinces", "accounts-merge", "graph-valid-tree"],
  run(input) {
    const g = buildGraph(input, false, "0-1,2-3,1-2,4-5,3-4,0-5");
    const n = g.nodes.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const size = new Array(n).fill(1);
    const f = new Frames();
    const edgeColor: Record<string, string> = {};
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const comps = () => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) m[i] = find(i);
      return m;
    };
    f.set("components", n).set("cycles", 0);
    f.push(`Start with ${n} separate sets, one per node.`, { ...g, parent: [...parent], comp: comps(), edgeColor: {} }, 0);
    for (const e of g.edges) {
      const ra = find(e.u), rb = find(e.v);
      f.push(`Edge ${e.u}-${e.v}. Root of ${e.u} is ${ra}, root of ${e.v} is ${rb}.`, { ...g, parent: [...parent], comp: comps(), edgeColor: { ...edgeColor }, activeEdge: `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}` }, 1);
      if (ra === rb) {
        edgeColor[`${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`] = C.swap;
        f.bump("cycles");
        f.push(`Same root already, so this edge closes a cycle.`, { ...g, parent: [...parent], comp: comps(), edgeColor: { ...edgeColor }, cycleEdge: `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}` }, 3);
        continue;
      }
      const [big, small] = size[ra] >= size[rb] ? [ra, rb] : [rb, ra];
      parent[small] = big;
      size[big] += size[small];
      edgeColor[`${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`] = C.path;
      f.bump("components", -1);
      f.push(`Different sets, so merge: ${small} now points at ${big}.`, { ...g, parent: [...parent], comp: comps(), edgeColor: { ...edgeColor } }, 4);
    }
    f.push(`Done. ${f.count.components} component${f.count.components === 1 ? "" : "s"} and ${f.count.cycles} cycle-closing edge${f.count.cycles === 1 ? "" : "s"}.`, { ...g, parent, comp: comps(), edgeColor, done: true }, 4);
    return f.all;
  },
};

export const kruskal: VizAlgo = {
  slug: "kruskal",
  name: "Kruskal Minimum Spanning Tree",
  topic: "graphs",
  kind: "graph",
  difficulty: "Medium",
  tags: ["greedy", "union find", "MST"],
  blurb: "Sort every edge by weight and take it whenever it joins two different components. Union-Find makes the cycle check cheap.",
  complexity: { time: "O(E log E)", space: "O(V)", note: "The cheapest edge crossing any cut is always safe, which is what makes the greedy choice correct." },
  pseudocode: [
    "sort edges by weight",
    "for (u, v, w) in edges:",
    "  if find(u) != find(v):",
    "    union(u, v); total += w",
    "stop once V-1 edges are taken",
  ],
  defaultInput: "0-1:4,0-2:1,1-2:2,1-3:5,2-3:8,3-4:3,2-4:7",
  inputHint: "weighted edges u-v:w",
  related: ["min-cost-to-connect-all-points", "kruskal-mst"],
  run(input) {
    const g = buildGraph(input, false, "0-1:4,0-2:1,1-2:2,1-3:5,2-3:8,3-4:3,2-4:7");
    const n = g.nodes.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const f = new Frames();
    const edgeColor: Record<string, string> = {};
    const sorted = [...g.edges].sort((a, b) => a.w - b.w);
    let total = 0, taken = 0;
    f.set("cost", 0);
    f.push(`Edges sorted by weight: ${sorted.map((e) => `${e.u}-${e.v}(${e.w})`).join(", ")}.`, { ...g, edgeColor: {}, sortedEdges: sorted.map((e) => `${e.u}-${e.v}:${e.w}`) }, 0);
    for (const e of sorted) {
      const k = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
      f.push(`Consider ${e.u}-${e.v} with weight ${e.w}.`, { ...g, edgeColor: { ...edgeColor }, activeEdge: k, cost: total }, 1);
      if (find(e.u) !== find(e.v)) {
        parent[find(e.u)] = find(e.v);
        edgeColor[k] = C.path;
        total += e.w;
        taken++;
        f.set("cost", total);
        f.push(`It connects two different components, so take it. Running cost ${total}.`, { ...g, edgeColor: { ...edgeColor }, cost: total, taken }, 3);
        if (taken === n - 1) break;
      } else {
        edgeColor[k] = C.ghost;
        f.push(`Both endpoints are already connected, so this edge would create a cycle. Skip it.`, { ...g, edgeColor: { ...edgeColor }, cost: total }, 2);
      }
    }
    f.push(`Spanning tree complete with ${taken} edges and total weight ${total}.`, { ...g, edgeColor, cost: total, done: true }, 4);
    return f.all;
  },
};

export const floodFill: VizAlgo = {
  slug: "number-of-islands",
  name: "Flood Fill / Number of Islands",
  topic: "graphs",
  kind: "grid",
  difficulty: "Medium",
  tags: ["grid", "DFS", "connected components"],
  blurb: "A grid is a graph where each cell touches its four neighbours. Sink each island as you walk it and count how many walks you start.",
  complexity: { time: "O(rows * cols)", space: "O(rows * cols) worst case", note: "Overwriting visited land avoids a separate visited matrix." },
  pseudocode: [
    "for each cell:",
    "  if cell is land:",
    "    islands++",
    "    dfs(cell)  // sink the whole island",
    "dfs: mark water, then recurse into 4 neighbours",
  ],
  defaultInput: "11000\n11000\n00100\n00011",
  inputHint: "Rows of 1 (land) and 0 (water)",
  related: ["number-of-islands", "surrounded-regions", "number-of-enclaves", "rotting-oranges"],
  run(input) {
    const rows = input
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split("").map((ch) => (ch === "1" ? 1 : 0)));
    const grid = rows.length ? rows : [[1, 1, 0], [0, 1, 0], [0, 0, 1]];
    const R = grid.length, Cc = grid[0].length;
    const f = new Frames();
    const colors: Record<string, string> = {};
    const palette = ["#6d5efc", "#2fd48f", "#ffb020", "#34d3ff", "#b15cff", "#ff5f6d"];
    let islands = 0;
    f.set("islands", 0);
    f.push("Scan the grid. Every unvisited land cell starts a new island.", { grid: grid.map((r) => [...r]), colors: {} }, 0);
    const dfs = (r: number, c: number, color: string) => {
      if (r < 0 || c < 0 || r >= R || c >= Cc || grid[r][c] !== 1) return;
      grid[r][c] = 2;
      colors[`${r},${c}`] = color;
      f.push(`Sink cell (${r}, ${c}) into the current island.`, { grid: grid.map((x) => [...x]), colors: { ...colors }, cursor: [r, c] }, 4);
      dfs(r + 1, c, color);
      dfs(r - 1, c, color);
      dfs(r, c + 1, color);
      dfs(r, c - 1, color);
    };
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cc; c++) {
        if (grid[r][c] === 1) {
          islands++;
          f.bump("islands");
          f.push(`Cell (${r}, ${c}) is land and untouched, so island ${islands} starts here.`, { grid: grid.map((x) => [...x]), colors: { ...colors }, cursor: [r, c] }, 2);
          dfs(r, c, palette[(islands - 1) % palette.length]);
        }
      }
    }
    f.push(`Found ${islands} island${islands === 1 ? "" : "s"}.`, { grid: grid.map((x) => [...x]), colors, done: true }, 3);
    return f.all;
  },
};

export const GRAPH_ALGOS = [graphBfs, graphDfs, dijkstra, topologicalSort, unionFind, kruskal, floodFill];
