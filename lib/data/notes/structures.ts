import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/structures.ts. */
export const STRUCTURES_NOTES: NoteBook = {
  "reverse-linked-list": {
    s: ["prev = null, cur = head.", "Save next, point cur.next at prev, advance both.", "Return prev."],
  },
  "linked-list-cycle": {
    s: ["Slow moves one step, fast moves two.", "They meet only if there is a cycle.", "fast or fast.next hitting null means no cycle."],
  },
  "linked-list-cycle-ii": {
    s: ["Find the meeting point with slow and fast.", "Reset one pointer to head.", "Move both one step at a time; they meet at the cycle start."],
  },
  "merge-two-sorted-lists": {
    s: ["Dummy head and a tail pointer.", "Attach the smaller node each step.", "Attach whatever list remains."],
  },
  "merge-k-sorted-lists": {
    s: ["Min-heap of the head of each list.", "Pop the smallest, append it, push its next.", "Or merge pairs of lists divide and conquer style."],
  },
  "remove-nth-node-from-end-of-list": {
    s: ["Dummy before head.", "Move fast n + 1 steps ahead of slow.", "Move both until fast is null; delete slow.next."],
    w: "The dummy node handles removing the head itself.",
  },
  "reorder-list": {
    s: ["Find the middle with slow and fast.", "Reverse the second half.", "Merge the two halves alternately."],
  },
  "middle-of-the-linked-list": {
    k: "Slow and fast pointers: when fast reaches the end, slow is in the middle.",
    s: ["slow = fast = head.", "While fast and fast.next: slow one step, fast two.", "Return slow (the second middle for even length)."],
    T: "O(n)", S: "O(1)",
  },
  "palindrome-linked-list": {
    s: ["Find the middle.", "Reverse the second half.", "Compare the halves node by node (restore if required)."],
  },
  "intersection-of-two-linked-lists": {
    s: ["Pointer a walks A then B; pointer b walks B then A.", "Both cover the same total length.", "They meet at the intersection, or both reach null."],
  },
  "add-two-numbers": {
    s: ["Digits are stored in reverse, so add from the heads.", "Sum both digits plus carry; emit sum % 10.", "Keep going while either list or the carry remains."],
    w: "A final carry needs its own node.",
  },
  "add-two-numbers-ii": {
    k: "Digits are most-significant first, so push both lists onto stacks and add from the tops.",
    s: ["Push each list's values onto a stack.", "Pop and add with carry.", "Prepend each new digit node to the result."],
    T: "O(n + m)", S: "O(n + m)",
  },
  "copy-list-with-random-pointer": {
    s: ["Interleave a copy after each node.", "copy.random = original.random.next.", "Unweave the two lists. (A hash map works too.)"],
  },
  "reverse-nodes-in-k-group": {
    s: ["Check that k nodes remain; if not, leave them.", "Reverse those k nodes.", "Connect the previous group's tail to the new head and continue."],
  },
  "swap-nodes-in-pairs": {
    k: "Rewire pairs using a dummy node and a prev pointer.",
    s: ["prev = dummy.", "While two nodes follow: a = prev.next, b = a.next.", "prev.next = b, a.next = b.next, b.next = a, prev = a."],
    T: "O(n)", S: "O(1)",
  },
  "rotate-list": {
    s: ["Find the length and the tail.", "k = k mod length; connect tail to head.", "Break the ring after length - k nodes."],
  },
  "remove-duplicates-from-sorted-list-ii": {
    k: "Use a dummy and skip every run of equal values entirely.",
    s: ["prev = dummy.", "If cur starts a run of duplicates, skip the whole run and link prev to the node after.", "Otherwise advance prev."],
    T: "O(n)", S: "O(1)",
  },
  "partition-list": {
    k: "Build two lists, less-than-x and the rest, then join them.",
    s: ["Two dummy heads.", "Append each node to the matching list.", "Join them and null-terminate the second."],
    w: "Forgetting to end the second list leaves a cycle.",
    T: "O(n)", S: "O(1)",
  },
  "sort-list": {
    s: ["Split at the middle with slow and fast.", "Sort both halves recursively.", "Merge them."],
  },
  "flatten-a-multilevel-doubly-linked-list": {
    k: "When a node has a child, splice the flattened child list between it and its next.",
    s: ["Walk the list.", "On a child: find the child's tail, link tail to next, node to child, clear the child pointer.", "Fix prev pointers as you splice."],
    T: "O(n)", S: "O(1)",
  },
  "flatten-linked-list": {
    k: "Every vertical list is sorted, so merge them one at a time along the bottom pointers.",
    s: ["Recursively flatten the list to the right.", "Merge the current vertical list with it using bottom pointers.", "Return the merged head."],
    T: "O(total nodes * lists)", S: "O(lists) recursion",
  },
  "reverse-linked-list-ii": {
    k: "Walk to the node before left, then head-insert the next right - left nodes.",
    s: ["Dummy; move prev to position left - 1.", "cur = prev.next; repeat right - left times: move cur.next to just after prev.", "Return dummy.next."],
    T: "O(n)", S: "O(1)",
  },
  "odd-even-linked-list": {
    k: "Build the odd-index and even-index chains in place, then append even after odd.",
    s: ["odd = head, even = head.next, evenHead = even.", "odd.next = even.next; even.next = odd.next, advancing both.", "odd.next = evenHead."],
    T: "O(n)", S: "O(1)",
  },
  "delete-node-in-a-linked-list": {
    k: "You cannot reach the previous node, so copy the next node's value in and delete the next node.",
    s: ["node.val = node.next.val.", "node.next = node.next.next."],
    T: "O(1)", S: "O(1)",
  },
  "design-linked-list": {
    k: "Singly linked list with a sentinel head and a size counter.",
    s: ["Sentinel removes head special cases.", "get/add/delete walk to index - 1 from the sentinel.", "Validate the index against size first."],
    T: "O(index) per op", S: "O(n)",
  },
  "lru-cache": {
    s: ["Hash map key -> node in a doubly linked list.", "get moves the node to the front.", "put inserts at the front and evicts from the back when over capacity."],
    w: "Use sentinel head and tail nodes to avoid null checks.",
  },
  "lfu-cache": {
    k: "Map key -> node, map frequency -> LRU list, and track the minimum frequency.",
    s: ["get: move the node from freq f to f + 1; if list f empties and f was min, min++.", "put new key: evict the LRU of the min-frequency list if full, insert at freq 1, min = 1.", "put existing key: update the value and touch like get."],
    T: "O(1)", S: "O(capacity)",
  },
  "min-stack": {
    s: ["Push pairs (value, min so far).", "getMin reads the top's min.", "Or keep a second stack of mins."],
  },
  "evaluate-reverse-polish-notation": {
    k: "Stack: push numbers; on an operator pop two and push the result.",
    s: ["Numbers go on the stack.", "Operator: b = pop, a = pop, push a op b.", "The final stack top is the answer."],
    w: "Pop order matters for - and /; the second pop is the left operand.",
    T: "O(n)", S: "O(n)",
  },
  "generate-parentheses": {
    s: ["Backtrack with counts of open and close.", "Add '(' while open < n.", "Add ')' while close < open."],
  },
  "daily-temperatures": {
    s: ["Monotonic stack of indices with decreasing temperatures.", "A warmer day pops every colder index and sets its wait.", "Push the current index."],
  },
  "next-greater-element-i": {
    k: "Monotonic stack over nums2 to map each value to its next greater, then look up nums1.",
    s: ["Walk nums2 with a decreasing stack.", "A larger value pops smaller ones and becomes their answer.", "Answer nums1 from the map, -1 if missing."],
    T: "O(n + m)", S: "O(n)",
  },
  "next-greater-element-ii": {
    s: ["Circular, so loop 2n times with index i % n.", "Decreasing stack of indices.", "Only push indices during the first pass."],
  },
  "car-fleet": {
    k: "Sort by position from the target backward; each car's arrival time either joins the fleet ahead or starts a new one.",
    s: ["Time = (target - pos) / speed.", "Process cars from closest to target.", "If a car's time is greater than the current fleet's time, it starts a new fleet."],
    T: "O(n log n)", S: "O(n)",
  },
  "largest-rectangle-in-histogram": {
    s: ["Increasing stack of indices.", "When a lower bar arrives, pop and compute height * width.", "Width runs from the new stack top + 1 to i - 1; add a 0 sentinel at the end."],
  },
  "maximal-rectangle": {
    s: ["Treat each row as the base of a histogram.", "heights[j] = heights[j] + 1 if the cell is 1, else 0.", "Run largest rectangle in histogram per row."],
  },
  "implement-queue-using-stacks": {
    s: ["Push onto an in-stack.", "Pop and peek from an out-stack.", "Refill out from in only when out is empty."],
  },
  "implement-stack-using-queues": {
    k: "After each push, rotate the queue so the newest element is at the front.",
    s: ["Enqueue x.", "Dequeue and re-enqueue size - 1 times.", "pop and top use the front."],
    T: "O(n) push, O(1) pop", S: "O(n)",
  },
  "asteroid-collision": {
    k: "Stack of survivors; a left-moving asteroid fights right-movers on the top.",
    s: ["Right-mover: push.", "Left-mover: pop smaller right-movers; equal size destroys both.", "Push it if it survives."],
    T: "O(n)", S: "O(n)",
  },
  "simplify-path": {
    k: "Split on '/', then use a stack: '..' pops, '.' and empty are skipped.",
    s: ["Split the path.", "Push names, pop on '..' if non-empty.", "Join with '/' and prefix '/'."],
    T: "O(n)", S: "O(n)",
  },
  "remove-k-digits": {
    k: "Increasing monotonic stack: drop a larger previous digit while removals remain.",
    s: ["While k > 0 and the top is greater than the digit, pop and k--.", "Push the digit.", "Trim k more from the end, strip leading zeros, return '0' if empty."],
    T: "O(n)", S: "O(n)",
  },
  "sum-of-subarray-minimums": {
    k: "Each element is the minimum of left * right subarrays, found with previous-less and next-less boundaries.",
    s: ["Monotonic stacks give the distance to the previous smaller and next smaller element.", "Contribution = arr[i] * left * right.", "Use strict on one side and non-strict on the other to avoid double counting duplicates."],
    T: "O(n)", S: "O(n)",
  },
  "online-stock-span": {
    k: "Stack of (price, span); merge spans of smaller or equal prices into the new one.",
    s: ["span = 1.", "While the top price <= price, add its span and pop.", "Push (price, span) and return span."],
    T: "O(1) amortised", S: "O(n)",
  },
  "stock-span-problem": {
    k: "Previous greater element via a decreasing stack of indices.",
    s: ["Pop while the top price <= current.", "Span = i - top index (or i + 1 if empty).", "Push i."],
    T: "O(n)", S: "O(n)",
  },
  "celebrity-problem": {
    s: ["Two pointers: if a knows b, a is not the celebrity, else b is not.", "One candidate survives.", "Verify the candidate knows nobody and everyone knows them."],
  },
  "design-circular-queue": {
    k: "Fixed array with head index and count; the tail is (head + count) mod k.",
    s: ["enQueue writes at (head + count) % k.", "deQueue advances head.", "Full when count == k, empty when count == 0."],
    T: "O(1)", S: "O(k)",
  },
  "first-negative-in-window": {
    k: "Queue of indices of negatives in the current window.",
    s: ["Push i if arr[i] < 0.", "Drop the front if it left the window.", "Once the window is full, the front is the answer (0 if empty)."],
    T: "O(n)", S: "O(k)",
  },
  "longest-valid-parentheses": {
    s: ["Stack of indices seeded with -1.", "'(' pushes; ')' pops.", "If empty after pop, push i as a new base; else length = i - top."],
  },
  "min-stack-o1-space": {
    k: "Store an encoded value 2x - min whenever a new minimum is pushed.",
    s: ["Push x < min: store 2x - min, set min = x.", "Pop a value below min: it was encoded, so restore min = 2min - stored.", "Top: if stored < min, the real top is min."],
    w: "2x - min can overflow; use 64-bit.",
    T: "O(1)", S: "O(1) extra",
  },
  "word-search": {
    s: ["DFS from every cell matching the first letter.", "Mark the cell visited, recurse to neighbours for the next letter.", "Unmark on the way back."],
  },
  "number-of-islands": {
    s: ["Scan every cell.", "On an unvisited '1', count an island and flood it (DFS or BFS).", "Mark land as water as you visit."],
  },
  "diagonal-traverse": {
    k: "Cells on the same anti-diagonal share r + c; the direction flips with its parity.",
    s: ["For d from 0 to m + n - 2, collect cells with r + c = d.", "Reverse the order when d is even.", "Append to the result."],
    T: "O(m * n)", S: "O(1) extra",
  },
  "game-of-life": {
    s: ["Encode the next state in spare bits so the current state is still readable.", "Count live neighbours from bit 0.", "Shift every cell right by one at the end."],
  },
  "spiral-matrix-ii": {
    k: "Fill 1..n^2 while walking the spiral with four shrinking bounds.",
    s: ["top, bottom, left, right.", "Fill right, down, left, up, shrinking each bound.", "Stop when the counter passes n^2."],
    T: "O(n^2)", S: "O(1) extra",
  },
  "print-matrix-snake-pattern": {
    k: "Even rows left to right, odd rows right to left.",
    s: ["Loop rows.", "Choose the direction by row parity."],
    T: "O(n * m)", S: "O(1)",
  },
  "row-with-max-ones": {
    k: "Rows are sorted, so walk a staircase from the top-right corner.",
    s: ["Start at row 0, last column.", "On a 1, move left and record this row.", "On a 0, move down."],
    T: "O(n + m)", S: "O(1)",
  },
  "common-elements-in-rows": {
    k: "Count, per value, how many rows contain it, counting each value once per row.",
    s: ["Map value -> last row seen and count.", "Increment only when the value is first seen in this row.", "Values whose count equals the number of rows are common."],
    T: "O(n * m)", S: "O(m)",
  },
  "transpose-matrix": {
    k: "result[j][i] = matrix[i][j] into a new c x r matrix.",
    s: ["Allocate cols x rows.", "Copy with swapped indices."],
    T: "O(r * c)", S: "O(r * c)",
  },
  "merge-intervals": {
    s: ["Sort by start.", "If the next start <= the last end, extend the end.", "Otherwise start a new interval."],
  },
  "insert-interval": {
    s: ["Add all intervals ending before the new one starts.", "Merge every overlapping interval into the new one.", "Add the rest."],
  },
  "non-overlapping-intervals": {
    s: ["Sort by end.", "Greedily keep an interval if it starts at or after the last kept end.", "Removals = total - kept."],
  },
  "meeting-rooms-ii": {
    s: ["Sort starts and ends separately.", "Walk starts; if a start is before the earliest end, a room is needed.", "Otherwise free a room by advancing the end pointer."],
  },
  "employee-free-time": {
    k: "Merge every schedule's intervals into one sorted list; the gaps between merged blocks are free time.",
    s: ["Flatten and sort by start (or use a heap over schedules).", "Track the furthest end.", "A start beyond that end creates a free gap."],
    T: "O(n log n)", S: "O(n)",
  },
  "interval-list-intersections": {
    k: "Two pointers; the overlap is [max(starts), min(ends)] when valid.",
    s: ["lo = max(a.start, b.start), hi = min(a.end, b.end).", "If lo <= hi, record it.", "Advance whichever interval ends first."],
    T: "O(n + m)", S: "O(1) extra",
  },
  "my-calendar-i": {
    k: "Keep booked intervals sorted and check the neighbours of the insertion point.",
    s: ["Find the first booking starting at or after start.", "Clash if it starts before end, or the previous one ends after start.", "Otherwise insert."],
    T: "O(log n) with a tree map", S: "O(n)",
  },
  "minimum-number-of-arrows": {
    k: "Sort by end and shoot at the end of the first unburst balloon.",
    s: ["Sort by end.", "arrow = first end, count = 1.", "Each balloon starting after arrow needs a new arrow at its end."],
    w: "Ends can be near the int limits; compare rather than subtract.",
    T: "O(n log n)", S: "O(1)",
  },
  "maximum-length-of-pair-chain": {
    k: "Activity selection: sort by the second element and take greedily.",
    s: ["Sort by end.", "Take a pair if its start is greater than the last taken end.", "Count them."],
    T: "O(n log n)", S: "O(1)",
  },
  "the-skyline-problem": {
    k: "Sweep the building edges and track the current max height with a max-heap (or a multiset).",
    s: ["Events: (x, -h) for starts and (x, h) for ends, sorted.", "Add or remove heights at each event.", "Whenever the max height changes, emit (x, newMax)."],
    w: "Sort order at equal x matters: starts before ends, taller starts first.",
    T: "O(n log n)", S: "O(n)",
  },
  "k-closest-points-to-origin": {
    s: ["Max-heap of size k keyed on squared distance.", "Pop when over k.", "Or quickselect on distance."],
  },
  "task-scheduler": {
    s: ["Find the max frequency f and how many tasks have it, c.", "Answer = max(n_tasks, (f - 1) * (n + 1) + c).", "Idle slots only appear when the most frequent task dominates."],
  },
  "kth-largest-element-in-a-stream": {
    k: "Min-heap holding the k largest values; the top is the answer.",
    s: ["Seed the heap with the initial numbers.", "add: push, pop if size > k.", "Return the top."],
    T: "O(log k) per add", S: "O(k)",
  },
  "reorganize-string": {
    s: ["If any count exceeds (n + 1) / 2, it is impossible.", "Place the most frequent letter on even indices first.", "Fill the rest of the evens, then the odds."],
  },
  "ugly-number-ii": {
    k: "Three pointers into the ugly list, multiplied by 2, 3 and 5.",
    s: ["ugly[0] = 1.", "next = min(u[i2]*2, u[i3]*3, u[i5]*5).", "Advance every pointer that produced next, to skip duplicates."],
    T: "O(n)", S: "O(n)",
  },
  "find-k-pairs-with-smallest-sums": {
    k: "Min-heap seeded with (nums1[i], nums2[0]); pop and push the next j.",
    s: ["Push (i, 0) for the first k values of i.", "Pop the smallest pair (i, j) and record it.", "Push (i, j + 1)."],
    T: "O(k log k)", S: "O(k)",
  },
  "sliding-window-median": {
    k: "Two heaps like the running median, with lazy deletion for elements leaving the window.",
    s: ["Balance a max-heap (low half) and min-heap (high half).", "Mark outgoing elements for deletion and pop them when they reach a top.", "Read the median from the tops each step."],
    T: "O(n log k)", S: "O(k)",
  },
  "ipo": {
    k: "Sort projects by capital; repeatedly unlock affordable ones into a max-heap of profit and take the best.",
    s: ["Sort by capital required.", "Push every project you can afford into a profit max-heap.", "Pop the best, add its profit; repeat k times."],
    T: "O(n log n)", S: "O(n)",
  },
  "minimum-cost-of-ropes": {
    s: ["Min-heap of rope lengths.", "Pop the two smallest, add their sum to cost, push the sum back.", "Repeat until one rope remains."],
  },
  "merge-k-sorted-arrays": {
    k: "Min-heap of (value, array, index) holding the next element of each array.",
    s: ["Push the first element of each array.", "Pop the smallest, output it, push its successor.", "Repeat until empty."],
    T: "O(N log k)", S: "O(k)",
  },
  "implement-heap": {
    s: ["Store the tree in an array: children at 2i + 1 and 2i + 2.", "Insert: append and sift up.", "Extract: swap the root with the last, pop, sift down."],
  },
  "minimum-sum-of-two-numbers": {
    k: "Sort the digits and deal them alternately into two numbers.",
    s: ["Sort ascending.", "Alternate digits between the two numbers.", "Add them (as strings if very long)."],
    T: "O(n log n)", S: "O(n)",
  },
};
