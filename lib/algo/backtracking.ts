import type { VizAlgo } from "@/lib/types";
import { Frames, parseNums, parseWords, splitOnPipe } from "./util";

export const nQueens: VizAlgo = {
  slug: "n-queens",
  name: "N-Queens",
  topic: "backtracking",
  kind: "grid",
  difficulty: "Hard",
  tags: ["backtracking", "pruning", "constraint sets"],
  blurb: "Place one queen per row. Track attacked columns and both diagonals in sets so every safety check is constant time.",
  complexity: { time: "Exponential, heavily pruned", space: "O(n)", note: "Row plus column identifies one diagonal, row minus column the other. That is the whole trick." },
  pseudocode: [
    "place(row):",
    "  if row == n: record solution; return",
    "  for col in 0..n-1:",
    "    if col or diagonals attacked: skip",
    "    mark; place(row+1); unmark   // undo is mandatory",
  ],
  defaultInput: "6",
  inputHint: "Board size from 4 to 8",
  related: ["n-queens", "sudoku-solver", "m-coloring-problem", "rat-in-a-maze"],
  run(input) {
    const n = Math.max(4, Math.min(8, Math.round(parseNums(input, [6])[0])));
    const f = new Frames();
    const board: number[] = [];
    const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
    let solutions = 0;
    f.set("placements", 0).set("backtracks", 0).set("solutions", 0);

    const grid = () =>
      Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => (board[r] === c ? "Q" : (r + c) % 2 === 0 ? "." : ",")),
      );

    const attacked = (row: number) => {
      const marks: Record<string, string> = {};
      for (let r = row; r < n; r++)
        for (let c = 0; c < n; c++)
          if (cols.has(c) || d1.has(r + c) || d2.has(r - c)) marks[`${r},${c}`] = "#ff5f6d22";
      return marks;
    };

    f.push(`Empty ${n} by ${n} board. Queens attack along rows, columns and both diagonals.`, { grid: grid(), colors: {}, queens: [] }, 0);

    const place = (row: number): boolean => {
      if (row === n) {
        solutions++;
        f.bump("solutions");
        f.push(`All ${n} queens placed with no conflicts. Solution ${solutions}.`, { grid: grid(), colors: {}, queens: [...board], solved: true }, 1);
        return solutions >= 2;
      }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(row + c) || d2.has(row - c)) {
          f.push(`Row ${row}, column ${c} is attacked, so prune it immediately.`, { grid: grid(), colors: { ...attacked(row), [`${row},${c}`]: "#ff5f6d55" }, queens: [...board], reject: [row, c] }, 3);
          continue;
        }
        board[row] = c;
        cols.add(c); d1.add(row + c); d2.add(row - c);
        f.bump("placements");
        f.push(`Place a queen at row ${row}, column ${c}.`, { grid: grid(), colors: attacked(row + 1), queens: [...board], place: [row, c] }, 4);
        if (place(row + 1)) return true;
        cols.delete(c); d1.delete(row + c); d2.delete(row - c);
        board.length = row;
        f.bump("backtracks");
        f.push(`Row ${row + 1} had nowhere legal to go, so remove this queen and try the next column.`, { grid: grid(), colors: attacked(row), queens: [...board], undo: [row, c] }, 4);
      }
      return false;
    };

    place(0);
    f.push(`Stopped after finding ${solutions} solution${solutions === 1 ? "" : "s"}. Pruning is what keeps this finishing at all.`, { grid: grid(), colors: {}, queens: [...board], done: true }, 4);
    return f.all;
  },
};

export const subsets: VizAlgo = {
  slug: "subsets",
  name: "Subsets (Take or Skip)",
  topic: "backtracking",
  kind: "recursion",
  difficulty: "Medium",
  tags: ["binary decisions", "recursion tree"],
  blurb: "Every element is either in or out. That binary choice at each index builds a decision tree with 2 to the n leaves.",
  complexity: { time: "O(n * 2^n)", space: "O(n) recursion depth", note: "Always copy the current path when recording it, or later mutations corrupt earlier answers." },
  pseudocode: [
    "dfs(i, path):",
    "  if i == n: record(path); return",
    "  path.push(a[i]); dfs(i+1, path); path.pop()   // take",
    "  dfs(i+1, path)                                 // skip",
  ],
  defaultInput: "1, 2, 3",
  inputHint: "Up to 4 values",
  related: ["subsets", "subsets-ii", "combination-sum", "palindrome-partitioning"],
  run(input) {
    const a = parseNums(input, [1, 2, 3]).slice(0, 4);
    const f = new Frames();
    const nodes: { id: number; label: string; parent: number | null; depth: number; state: string }[] = [];
    const results: string[] = [];
    const path: number[] = [];

    const dfs = (i: number, parent: number | null) => {
      const id = nodes.length;
      nodes.push({ id, label: path.length ? `[${path.join(",")}]` : "[ ]", parent, depth: i, state: "active" });
      if (i === a.length) {
        nodes[id].state = "base";
        results.push(`[${path.join(",")}]`);
        f.push(`End of the array. Record the subset [${path.join(", ")}].`, { nodes: nodes.map((x) => ({ ...x })), current: id, results: [...results], path: [...path], mode: "subsets" }, 1);
        return;
      }
      f.push(`At index ${i}, value ${a[i]}. Two branches: take it or skip it.`, { nodes: nodes.map((x) => ({ ...x })), current: id, results: [...results], path: [...path], mode: "subsets" }, 0);
      path.push(a[i]);
      f.push(`Take ${a[i]}. Path is now [${path.join(", ")}].`, { nodes: nodes.map((x) => ({ ...x })), current: id, results: [...results], path: [...path], mode: "subsets", taking: a[i] }, 2);
      dfs(i + 1, id);
      path.pop();
      f.push(`Undo the choice, so the path returns to [${path.join(", ")}]. This is the backtrack.`, { nodes: nodes.map((x) => ({ ...x })), current: id, results: [...results], path: [...path], mode: "subsets", undo: a[i] }, 2);
      dfs(i + 1, id);
      nodes[id].state = "done";
    };

    dfs(0, null);
    f.push(`${results.length} subsets, which is 2 to the power ${a.length}.`, { nodes: nodes.map((x) => ({ ...x })), results, path: [], mode: "subsets", done: true }, 3, { subsets: results.length });
    return f.all;
  },
};

export const permutations: VizAlgo = {
  slug: "permutations",
  name: "Permutations (Swap and Recurse)",
  topic: "backtracking",
  kind: "array",
  difficulty: "Medium",
  tags: ["swap in place", "factorial"],
  blurb: "Fix each candidate in the current position by swapping it forward, recurse on the rest, then swap back.",
  complexity: { time: "O(n! * n)", space: "O(n)", note: "Swapping avoids a used array and any extra allocation." },
  pseudocode: [
    "dfs(i):",
    "  if i == n: record(a); return",
    "  for j in i..n-1:",
    "    swap(a[i], a[j])",
    "    dfs(i+1)",
    "    swap(a[i], a[j])   // restore",
  ],
  defaultInput: "1, 2, 3",
  inputHint: "Up to 4 values",
  related: ["permutations", "permutations-ii", "next-permutation", "kth-permutation-sequence"],
  run(input) {
    const a = parseNums(input, [1, 2, 3]).slice(0, 4);
    const f = new Frames();
    const results: string[] = [];
    f.push("Decide position 0 first, then position 1, and so on.", { arr: [...a], results: [] }, 0);
    const dfs = (i: number) => {
      if (i === a.length) {
        results.push(`[${a.join(",")}]`);
        f.push(`Every position is fixed. Record [${a.join(", ")}].`, { arr: [...a], results: [...results], sorted: a.map((_, k) => k) }, 1);
        return;
      }
      for (let j = i; j < a.length; j++) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          f.push(`Swap ${a[i]} into position ${i}.`, { arr: [...a], results: [...results], swap: [i, j], fixed: Array.from({ length: i }, (_, k) => k) }, 3);
        } else {
          f.push(`Keep ${a[i]} in position ${i} and permute the rest.`, { arr: [...a], results: [...results], compare: [i], fixed: Array.from({ length: i }, (_, k) => k) }, 3);
        }
        dfs(i + 1);
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          f.push(`Restore the array before trying the next candidate for position ${i}.`, { arr: [...a], results: [...results], swap: [i, j], fixed: Array.from({ length: i }, (_, k) => k) }, 5);
        }
      }
    };
    dfs(0);
    f.push(`${results.length} permutations, which is ${a.length} factorial.`, { arr: [...a], results, done: true }, 5, { permutations: results.length });
    return f.all;
  },
};

export const sudokuSolver: VizAlgo = {
  slug: "sudoku-solver",
  name: "Sudoku Solver",
  topic: "backtracking",
  kind: "grid",
  difficulty: "Hard",
  tags: ["constraint propagation", "backtracking"],
  blurb: "Fill the first empty cell with each legal digit and recurse. Validating as you place, rather than at the end, is what makes it tractable.",
  complexity: { time: "Exponential in theory, instant in practice", space: "O(1) extra", note: "Box index is row over three times three plus column over three." },
  pseudocode: [
    "solve():",
    "  find first empty cell",
    "  for d in 1..9:",
    "    if d is legal in row, column and box:",
    "      place d; if solve(): return true; erase d",
    "  return false",
  ],
  defaultInput: "4x4",
  inputHint: "4x4 for a quick demo, 9x9 for the real thing",
  related: ["sudoku-solver", "valid-sudoku", "n-queens"],
  run(input) {
    const small = !input.includes("9");
    const N = small ? 4 : 9;
    const B = small ? 2 : 3;
    const puzzle: number[][] = small
      ? [
          [1, 0, 0, 0],
          [0, 0, 3, 0],
          [0, 4, 0, 0],
          [0, 0, 0, 2],
        ]
      : [
          [5, 3, 0, 0, 7, 0, 0, 0, 0],
          [6, 0, 0, 1, 9, 5, 0, 0, 0],
          [0, 9, 8, 0, 0, 0, 0, 6, 0],
          [8, 0, 0, 0, 6, 0, 0, 0, 3],
          [4, 0, 0, 8, 0, 3, 0, 0, 1],
          [7, 0, 0, 0, 2, 0, 0, 0, 6],
          [0, 6, 0, 0, 0, 0, 2, 8, 0],
          [0, 0, 0, 4, 1, 9, 0, 0, 5],
          [0, 0, 0, 0, 8, 0, 0, 7, 9],
        ];
    const given = puzzle.map((r) => r.map((v) => v !== 0));
    const f = new Frames();
    f.set("placements", 0).set("backtracks", 0);
    const colors = () => {
      const c: Record<string, string> = {};
      for (let r = 0; r < N; r++) for (let q = 0; q < N; q++) if (given[r][q]) c[`${r},${q}`] = "#6d5efc22";
      return c;
    };
    const legal = (r: number, c: number, d: number) => {
      for (let i = 0; i < N; i++) if (puzzle[r][i] === d || puzzle[i][c] === d) return false;
      const br = Math.floor(r / B) * B, bc = Math.floor(c / B) * B;
      for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (puzzle[br + i][bc + j] === d) return false;
      return true;
    };
    f.push(`Given digits are fixed. Fill the rest so every row, column and ${B} by ${B} box holds 1 to ${N} once.`, { grid: puzzle.map((r) => [...r]), colors: colors() }, 0);
    let budget = 900;
    const solve = (): boolean => {
      if (budget-- <= 0) return true;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (puzzle[r][c] !== 0) continue;
          for (let d = 1; d <= N; d++) {
            if (!legal(r, c, d)) continue;
            puzzle[r][c] = d;
            f.bump("placements");
            f.push(`Try ${d} at (${r}, ${c}). It clashes with nothing in the row, column or box.`, { grid: puzzle.map((x) => [...x]), colors: colors(), cursor: [r, c] }, 4);
            if (solve()) return true;
            puzzle[r][c] = 0;
            f.bump("backtracks");
            f.push(`${d} at (${r}, ${c}) led to a dead end, so erase it.`, { grid: puzzle.map((x) => [...x]), colors: colors(), cursor: [r, c], undo: true }, 4);
          }
          return false;
        }
      }
      return true;
    };
    solve();
    f.push(`Solved with ${f.count.placements} placements and ${f.count.backtracks} backtracks.`, { grid: puzzle.map((x) => [...x]), colors: colors(), done: true }, 5);
    return f.all;
  },
};

export const BACKTRACK_ALGOS = [nQueens, subsets, permutations, sudokuSolver];
export { parseWords, splitOnPipe };
