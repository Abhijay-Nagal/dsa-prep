import type { VizAlgo } from "@/lib/types";
import { Frames, parseNums, parseWords, splitOnPipe } from "./util";

export const kmp: VizAlgo = {
  slug: "kmp",
  name: "KMP Pattern Matching",
  topic: "strings",
  kind: "text",
  difficulty: "Hard",
  tags: ["prefix function", "linear matching"],
  blurb:
    "The prefix table records how much of the pattern is reusable after a mismatch, so the text pointer never moves backwards.",
  complexity: { time: "O(n + m)", space: "O(m)", note: "Naive matching restarts the text pointer after every mismatch, which is O(n*m)." },
  pseudocode: [
    "build lps: longest proper prefix that is also a suffix",
    "i = 0 (text), j = 0 (pattern)",
    "while i < n:",
    "  if text[i] == pat[j]: i++, j++",
    "  else if j > 0: j = lps[j-1]   // reuse the overlap",
    "  else: i++",
    "if j == m: match at i - m",
  ],
  defaultInput: "ababcabcabababd | ababd",
  inputHint: "text | pattern",
  related: ["kmp-algorithm", "find-first-occurrence-in-string", "repeated-substring-pattern", "shortest-palindrome"],
  run(input) {
    const [textPart, patPart] = splitOnPipe(input);
    const text = (textPart.trim() || "ababcabcabababd").replace(/\s/g, "").slice(0, 32);
    const pat = (patPart.trim() || "ababd").replace(/\s/g, "").slice(0, 12);
    const f = new Frames();
    const m = pat.length;
    const lps = new Array(m).fill(0);

    f.push(`Pattern "${pat}". First build the prefix table, which says how far to fall back on a mismatch.`, { text, pat, lps: [...lps], phase: "lps" }, 0);
    let len = 0;
    for (let i = 1; i < m; ) {
      if (pat[i] === pat[len]) {
        lps[i] = ++len;
        f.push(`pat[${i}] = ${pat[i]} matches pat[${len - 1}], so the reusable prefix is now length ${len}.`, { text, pat, lps: [...lps], phase: "lps", lpsI: i, lpsLen: len }, 0);
        i++;
      } else if (len) {
        f.push(`Mismatch, so fall back to lps[${len - 1}] = ${lps[len - 1]} instead of restarting.`, { text, pat, lps: [...lps], phase: "lps", lpsI: i, lpsLen: len }, 0);
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        f.push(`No reusable prefix at index ${i}.`, { text, pat, lps: [...lps], phase: "lps", lpsI: i }, 0);
        i++;
      }
    }
    f.push(`Prefix table: [${lps.join(", ")}].`, { text, pat, lps: [...lps], phase: "lps" }, 0);

    let i = 0, j = 0;
    const matches: number[] = [];
    f.set("comparisons", 0);
    f.push("Now scan the text. The text pointer only ever moves forward.", { text, pat, lps, phase: "search", i: 0, j: 0, matches: [] }, 1);
    while (i < text.length) {
      f.bump("comparisons");
      if (text[i] === pat[j]) {
        f.push(`text[${i}] = ${text[i]} matches pat[${j}]. Advance both.`, { text, pat, lps, phase: "search", i, j, matches: [...matches], hit: true }, 3);
        i++; j++;
        if (j === m) {
          matches.push(i - m);
          f.push(`Full pattern matched ending at ${i - 1}, so it starts at index ${i - m}.`, { text, pat, lps, phase: "search", i, j: 0, matches: [...matches], found: i - m }, 6);
          j = lps[j - 1];
        }
      } else if (j > 0) {
        f.push(`Mismatch at text[${i}] = ${text[i]}. We already know the first ${lps[j - 1]} characters match, so jump the pattern instead of the text.`, { text, pat, lps, phase: "search", i, j, matches: [...matches], fallback: lps[j - 1] }, 4);
        j = lps[j - 1];
      } else {
        f.push(`Mismatch with nothing reusable, so slide the text pointer forward.`, { text, pat, lps, phase: "search", i, j, matches: [...matches] }, 5);
        i++;
      }
    }
    f.push(`Found ${matches.length} occurrence${matches.length === 1 ? "" : "s"} using ${f.count.comparisons} comparisons. A naive scan would take up to ${text.length * m}.`, { text, pat, lps, phase: "search", matches, done: true }, 6);
    return f.all;
  },
};

export const trieViz: VizAlgo = {
  slug: "trie",
  name: "Trie (Prefix Tree)",
  topic: "tries",
  kind: "tree",
  difficulty: "Medium",
  tags: ["prefix sharing", "dictionary"],
  blurb: "Words that share a prefix share a path. Lookup costs the length of the word, no matter how large the dictionary grows.",
  complexity: { time: "O(word length) per operation", space: "O(total characters)", note: "Autocomplete, wildcard search and maximum XOR pairs are all tries underneath." },
  pseudocode: [
    "insert(word):",
    "  node = root",
    "  for ch in word:",
    "    if ch not in node.children: create it",
    "    node = node.children[ch]",
    "  node.isWord = true",
  ],
  defaultInput: "cat, car, card, dog, do",
  inputHint: "Comma separated words",
  related: ["implement-trie-prefix-tree", "design-add-and-search-words-data-structure", "word-search-ii", "search-suggestions-system"],
  run(input) {
    const words = parseWords(input.replace(/,/g, " "), ["cat", "car", "card", "dog", "do"]).slice(0, 7);
    const f = new Frames();
    interface N { id: number; ch: string; parent: number | null; word: boolean; depth: number }
    const nodes: N[] = [{ id: 0, ch: "*", parent: null, word: false, depth: 0 }];
    const childOf = (id: number, ch: string) => nodes.find((n) => n.parent === id && n.ch === ch);

    const layout = () => {
      const byDepth: Record<number, N[]> = {};
      for (const n of nodes) (byDepth[n.depth] ??= []).push(n);
      const maxD = Math.max(...nodes.map((n) => n.depth));
      return nodes.map((n) => {
        const row = byDepth[n.depth];
        const idx = row.indexOf(n);
        return {
          id: n.id,
          val: n.ch,
          isWord: n.word,
          x: 8 + ((idx + 0.5) / row.length) * 84,
          y: maxD === 0 ? 50 : 10 + (n.depth / maxD) * 78,
          parent: n.parent,
        };
      });
    };

    f.push("Start with an empty root. Each edge is one character.", { trie: layout(), color: {} }, 0);
    for (const w of words) {
      let cur = 0;
      const path = [0];
      for (const ch of w) {
        const existing = childOf(cur, ch);
        if (existing) {
          cur = existing.id;
          path.push(cur);
          f.push(`Inserting "${w}": the edge for ${ch} already exists, so reuse it. This is the prefix sharing that makes tries compact.`, { trie: layout(), color: Object.fromEntries(path.map((p) => [p, "#34d3ff"])), inserting: w, reused: cur }, 3);
        } else {
          const id = nodes.length;
          nodes.push({ id, ch, parent: cur, word: false, depth: nodes[cur].depth + 1 });
          cur = id;
          path.push(cur);
          f.push(`Inserting "${w}": create a new node for ${ch}.`, { trie: layout(), color: Object.fromEntries(path.map((p) => [p, "#6d5efc"])), inserting: w, created: cur }, 4);
        }
      }
      nodes[cur].word = true;
      f.push(`Mark the end of "${w}".`, { trie: layout(), color: { [cur]: "#2fd48f" }, inserting: w, terminal: cur }, 5);
    }

    const probe = words[0].slice(0, Math.max(1, words[0].length - 1));
    let cur = 0;
    const path = [0];
    for (const ch of probe) {
      const nx = childOf(cur, ch);
      if (!nx) break;
      cur = nx.id;
      path.push(cur);
      f.push(`Searching prefix "${probe}": followed ${ch}.`, { trie: layout(), color: Object.fromEntries(path.map((p) => [p, "#ffb020"])), searching: probe }, 2);
    }
    const below = nodes.filter((n) => {
      let p: number | null = n.id;
      while (p !== null && p !== cur) p = nodes[p].parent;
      return p === cur && n.word;
    });
    f.push(`Prefix "${probe}" leads to ${below.length} complete word${below.length === 1 ? "" : "s"} in the subtree below. That is exactly how autocomplete works.`, { trie: layout(), color: Object.fromEntries(path.map((p) => [p, "#ffb020"])), searching: probe, done: true }, 5);
    return f.all;
  },
};

export const sieve: VizAlgo = {
  slug: "sieve",
  name: "Sieve of Eratosthenes",
  topic: "math",
  kind: "grid",
  difficulty: "Medium",
  tags: ["number theory", "marking multiples"],
  blurb: "Walk the numbers. The first unmarked number is prime, and all of its multiples are not. Start marking from its square.",
  complexity: { time: "O(n log log n)", space: "O(n)", note: "Starting from p squared is safe because smaller multiples already carry a smaller prime factor." },
  pseudocode: [
    "isPrime[2..n] = true",
    "for p from 2 while p*p <= n:",
    "  if isPrime[p]:",
    "    for m from p*p to n step p:",
    "      isPrime[m] = false",
  ],
  defaultInput: "50",
  inputHint: "An upper bound up to 100",
  related: ["sieve-of-eratosthenes", "count-primes"],
  run(input) {
    const n = Math.max(10, Math.min(100, Math.round(parseNums(input, [50])[0])));
    const f = new Frames();
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    const cols = 10;
    const toGrid = () => {
      const rows: (string | number)[][] = [];
      for (let r = 0; r * cols <= n; r++) {
        rows.push(Array.from({ length: cols }, (_, c) => {
          const v = r * cols + c;
          return v <= n ? v : "";
        }));
      }
      return rows;
    };
    const colorMap = (extra: Record<string, string> = {}) => {
      const c: Record<string, string> = {};
      for (let v = 0; v <= n; v++) {
        const r = Math.floor(v / cols), cc = v % cols;
        if (v < 2) c[`${r},${cc}`] = "#1a2236";
        else c[`${r},${cc}`] = isPrime[v] ? "#2fd48f33" : "#ff5f6d22";
      }
      return { ...c, ...extra };
    };
    f.push(`Assume every number from 2 to ${n} is prime, then eliminate.`, { grid: toGrid(), colors: colorMap(), labelled: true }, 0);
    for (let p = 2; p * p <= n; p++) {
      if (!isPrime[p]) {
        f.push(`${p} was already crossed out, so skip it.`, { grid: toGrid(), colors: colorMap(), labelled: true }, 2);
        continue;
      }
      f.push(`${p} survived, so it is prime. Now remove its multiples, starting at ${p * p}.`, { grid: toGrid(), colors: colorMap({ [`${Math.floor(p / cols)},${p % cols}`]: "#6d5efc" }), labelled: true, current: p }, 2);
      for (let m = p * p; m <= n; m += p) {
        isPrime[m] = false;
        f.bump("crossed");
        f.push(`${m} is ${p} times ${m / p}, so it is composite.`, { grid: toGrid(), colors: colorMap({ [`${Math.floor(m / cols)},${m % cols}`]: "#ff5f6d" }), labelled: true, current: p }, 4);
      }
    }
    const primes = isPrime.map((v, i) => (v ? i : 0)).filter(Boolean);
    f.push(`${primes.length} primes up to ${n}: ${primes.join(", ")}.`, { grid: toGrid(), colors: colorMap(), labelled: true, done: true, primes }, 4, { primes: primes.length });
    return f.all;
  },
};

export const STRING_ALGOS = [kmp, trieViz, sieve];
