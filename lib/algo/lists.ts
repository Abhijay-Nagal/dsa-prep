import type { VizAlgo } from "@/lib/types";
import { C, Frames, parseNums, splitOnPipe } from "./util";

export const reverseLinkedList: VizAlgo = {
  slug: "reverse-linked-list",
  name: "Reverse a Linked List",
  topic: "linked-list",
  kind: "linkedlist",
  difficulty: "Easy",
  tags: ["three pointers", "in place"],
  blurb: "Three pointers, one flipped link per step. The whole trick is saving the next node before you overwrite it.",
  complexity: { time: "O(n)", space: "O(1)", note: "Every list problem that rewires pointers is a variation of this loop." },
  pseudocode: [
    "prev = null; cur = head",
    "while cur:",
    "  nxt = cur.next     // save it first",
    "  cur.next = prev    // flip the link",
    "  prev = cur",
    "  cur = nxt",
    "return prev",
  ],
  defaultInput: "1, 2, 3, 4, 5",
  inputHint: "Node values in order",
  related: ["reverse-linked-list", "reverse-nodes-in-k-group", "reorder-list", "palindrome-linked-list"],
  run(input) {
    const vals = parseNums(input, [1, 2, 3, 4, 5]).slice(0, 8);
    const f = new Frames();
    const nodes = vals.map((v, i) => ({ id: i, val: v }));
    const next: Record<number, number | null> = {};
    for (let i = 0; i < nodes.length; i++) next[i] = i + 1 < nodes.length ? i + 1 : null;
    let prev: number | null = null;
    let cur: number | null = 0;
    const ptrs = () => [
      ...(prev !== null ? [{ name: "prev", id: prev, color: C.done }] : []),
      ...(cur !== null ? [{ name: "cur", id: cur, color: C.active }] : []),
    ];
    f.set("flips", 0);
    f.push("Start with prev as null and cur at the head.", { nodes, next: { ...next }, pointers: ptrs(), head: 0 }, 0);
    while (cur !== null) {
      const nxt: number | null = next[cur];
      f.push(`Save next as ${nxt === null ? "null" : nodes[nxt].val}. Without this the rest of the list is lost.`, { nodes, next: { ...next }, pointers: [...ptrs(), ...(nxt !== null ? [{ name: "nxt", id: nxt, color: C.compare }] : [])], head: 0 }, 2);
      next[cur] = prev;
      f.bump("flips");
      f.push(`Point ${nodes[cur].val} backwards at ${prev === null ? "null" : nodes[prev].val}.`, { nodes, next: { ...next }, pointers: [...ptrs(), ...(nxt !== null ? [{ name: "nxt", id: nxt, color: C.compare }] : [])], head: 0, flipped: cur }, 3);
      prev = cur;
      cur = nxt;
      f.push(`Advance both pointers one node.`, { nodes, next: { ...next }, pointers: ptrs(), head: 0 }, 5);
    }
    f.push(`cur fell off the end, so prev is the new head: ${prev !== null ? nodes[prev].val : "null"}.`, { nodes, next: { ...next }, pointers: ptrs(), head: prev, done: true }, 6);
    return f.all;
  },
};

export const floydCycle: VizAlgo = {
  slug: "floyd-cycle",
  name: "Floyd Cycle Detection",
  topic: "linked-list",
  kind: "linkedlist",
  difficulty: "Medium",
  tags: ["fast and slow", "constant space"],
  blurb: "One pointer moves twice as fast. If there is a loop they must meet inside it, and resetting one to the head finds where the loop starts.",
  complexity: { time: "O(n)", space: "O(1)", note: "A visited set also works but costs O(n) memory, which the interviewer will ban." },
  pseudocode: [
    "slow = head; fast = head",
    "while fast and fast.next:",
    "  slow = slow.next; fast = fast.next.next",
    "  if slow == fast: cycle found",
    "// find entry: reset slow to head,",
    "// then advance both one step at a time",
  ],
  defaultInput: "1, 2, 3, 4, 5, 6 | 2",
  inputHint: "values | index the tail loops back to (-1 for no loop)",
  related: ["linked-list-cycle", "linked-list-cycle-ii", "find-the-duplicate-number", "happy-number"],
  run(input) {
    const [valPart, loopPart] = splitOnPipe(input);
    const vals = parseNums(valPart, [1, 2, 3, 4, 5, 6]).slice(0, 9);
    const loopTo = Math.round(parseNums(loopPart, [2])[0]);
    const nodes = vals.map((v, i) => ({ id: i, val: v }));
    const next: Record<number, number | null> = {};
    for (let i = 0; i < nodes.length; i++) next[i] = i + 1 < nodes.length ? i + 1 : null;
    if (loopTo >= 0 && loopTo < nodes.length) next[nodes.length - 1] = loopTo;
    const f = new Frames();
    let slow = 0, fast = 0;
    const ptrs = () => [
      { name: "slow", id: slow, color: C.active },
      { name: "fast", id: fast, color: C.compare },
    ];
    f.set("steps", 0);
    f.push(`Both pointers start at the head.${loopTo >= 0 ? ` The tail loops back to index ${loopTo}.` : " This list has no loop."}`, { nodes, next: { ...next }, pointers: ptrs(), head: 0, cyclic: loopTo >= 0 }, 0);
    let met = false;
    let guard = 0;
    while (next[fast] !== null && next[next[fast]!] !== undefined && next[next[fast]!] !== null && guard++ < 60) {
      slow = next[slow]!;
      fast = next[next[fast]!]!;
      f.bump("steps");
      f.push(`slow is at ${nodes[slow].val}, fast is at ${nodes[fast].val}.`, { nodes, next: { ...next }, pointers: ptrs(), head: 0, cyclic: loopTo >= 0 }, 2);
      if (slow === fast) {
        met = true;
        f.push(`They met at ${nodes[slow].val}. Two runners on a circular track always meet, so there is a cycle.`, { nodes, next: { ...next }, pointers: ptrs(), head: 0, meeting: slow, cyclic: true }, 3);
        break;
      }
    }
    if (!met) {
      f.push("fast reached the end of the list, so there is no cycle.", { nodes, next: { ...next }, pointers: ptrs(), head: 0, done: true }, 1);
      return f.all;
    }
    slow = 0;
    f.push("Now reset slow to the head and move both one step at a time. The distance maths makes them meet exactly at the loop entry.", { nodes, next: { ...next }, pointers: ptrs(), head: 0, cyclic: true }, 4);
    while (slow !== fast) {
      slow = next[slow]!;
      fast = next[fast]!;
      f.push(`slow at ${nodes[slow].val}, fast at ${nodes[fast].val}.`, { nodes, next: { ...next }, pointers: ptrs(), head: 0, cyclic: true }, 5);
    }
    f.push(`The cycle starts at ${nodes[slow].val}, index ${slow}.`, { nodes, next: { ...next }, pointers: ptrs(), head: 0, entry: slow, done: true, cyclic: true }, 5);
    return f.all;
  },
};

export const mergeTwoLists: VizAlgo = {
  slug: "merge-two-lists",
  name: "Merge Two Sorted Lists",
  topic: "linked-list",
  kind: "linkedlist",
  difficulty: "Easy",
  tags: ["dummy head", "two pointers"],
  blurb: "A dummy head removes every empty-list edge case. Then just attach whichever front node is smaller.",
  complexity: { time: "O(n + m)", space: "O(1)", note: "This merge step is also the core of merge sort and of merging k lists." },
  pseudocode: [
    "dummy = new Node(); tail = dummy",
    "while a and b:",
    "  if a.val <= b.val: tail.next = a; a = a.next",
    "  else: tail.next = b; b = b.next",
    "  tail = tail.next",
    "tail.next = a or b     // attach the remainder",
  ],
  defaultInput: "1, 3, 5 | 2, 4, 6",
  inputHint: "first sorted list | second sorted list",
  related: ["merge-two-sorted-lists", "merge-k-sorted-lists", "sort-list", "merge-sorted-array"],
  run(input) {
    const [aPart, bPart] = splitOnPipe(input);
    const av = parseNums(aPart, [1, 3, 5]).sort((x, y) => x - y).slice(0, 6);
    const bv = parseNums(bPart, [2, 4, 6]).sort((x, y) => x - y).slice(0, 6);
    const f = new Frames();
    const nodes = [
      ...av.map((v, i) => ({ id: i, val: v, lane: 0 })),
      ...bv.map((v, i) => ({ id: av.length + i, val: v, lane: 1 })),
    ];
    let i = 0, j = 0;
    const out: number[] = [];
    f.push("Two sorted lists. Compare the two front nodes and take the smaller.", { nodes, lanes: 2, out: [], pointers: [{ name: "a", id: 0, color: C.active }, { name: "b", id: av.length, color: C.compare }] }, 0);
    while (i < av.length && j < bv.length) {
      const aId = i, bId = av.length + j;
      if (av[i] <= bv[j]) {
        out.push(aId);
        f.push(`${av[i]} is at most ${bv[j]}, so append ${av[i]}.`, { nodes, lanes: 2, out: [...out], pointers: [{ name: "a", id: aId, color: C.active }, { name: "b", id: bId, color: C.compare }], taken: aId }, 2);
        i++;
      } else {
        out.push(bId);
        f.push(`${bv[j]} is smaller, so append ${bv[j]}.`, { nodes, lanes: 2, out: [...out], pointers: [{ name: "a", id: aId, color: C.active }, { name: "b", id: bId, color: C.compare }], taken: bId }, 3);
        j++;
      }
    }
    while (i < av.length) { out.push(i); f.push(`List B is exhausted, so attach the rest of A starting at ${av[i]}.`, { nodes, lanes: 2, out: [...out] }, 5); i++; }
    while (j < bv.length) { out.push(av.length + j); f.push(`List A is exhausted, so attach the rest of B starting at ${bv[j]}.`, { nodes, lanes: 2, out: [...out] }, 5); j++; }
    f.push(`Merged: ${out.map((id) => nodes[id].val).join(" -> ")}.`, { nodes, lanes: 2, out, done: true }, 5);
    return f.all;
  },
};

export const LIST_ALGOS = [reverseLinkedList, floydCycle, mergeTwoLists];
