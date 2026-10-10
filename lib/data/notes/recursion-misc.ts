import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/recursion-misc.ts. */
export const RECURSION_MISC_NOTES: NoteBook = {
  "subsets": {
    s: ["Backtrack from index i: record the current subset first.", "For j from i, add nums[j], recurse with j + 1, remove it.", "Or iterate masks 0..2^n - 1."],
  },
  "subsets-ii": {
    s: ["Sort so duplicates sit together.", "Same backtracking as Subsets.", "At one depth, skip nums[j] if j > i and it equals nums[j-1]."],
  },
  "combination-sum": {
    s: ["Backtrack with a start index and the remaining target.", "Recurse with the same index, since reuse is allowed.", "Sort and break once a candidate exceeds the remainder."],
  },
  "combination-sum-ii": {
    k: "Sorted backtracking where each number is used once and equal numbers are skipped at the same depth.",
    s: ["Sort the candidates.", "Recurse with j + 1 after choosing j.", "Skip j if j > start and c[j] == c[j-1]; break when c[j] > remaining."],
    T: "O(2^n)", S: "O(n)",
  },
  "permutations": {
    s: ["Backtrack with a used[] array.", "Append each unused number, recurse, then undo.", "Record when the path has n numbers."],
  },
  "permutations-ii": {
    k: "Sort, then skip a duplicate unless its identical predecessor is already in use.",
    s: ["Sort nums and keep used[].", "Skip i if used, or if nums[i] == nums[i-1] and !used[i-1].", "Backtrack as usual."],
    T: "O(n * n!)", S: "O(n)",
  },
  "palindrome-partitioning": {
    k: "Backtrack over cut positions, only cutting off palindromic prefixes.",
    s: ["From start, try every end where s[start..end] is a palindrome.", "Add it to the path and recurse from end + 1.", "Record the path when start reaches n."],
    T: "O(n * 2^n)", S: "O(n)",
  },
  "letter-combinations-of-a-phone-number": {
    k: "Backtrack one digit at a time over its mapped letters.",
    s: ["Map digits 2-9 to letters.", "At index i, try each letter for digits[i] and recurse.", "Record when the path has every digit; empty input returns []."],
    T: "O(4^n * n)", S: "O(n)",
  },
  "n-queens": {
    s: ["Place one queen per row.", "Track used columns, diagonals (r - c) and anti-diagonals (r + c).", "Backtrack when no column is safe."],
  },
  "sudoku-solver": {
    s: ["Find the next empty cell.", "Try 1-9 that are not in its row, column or box.", "Recurse; undo on failure. Bitmasks make the checks O(1)."],
  },
  "rat-in-a-maze": {
    k: "DFS from (0, 0) in D, L, R, U order, marking cells on the current path.",
    s: ["Mark the cell visited, try each direction into open unvisited cells.", "Record the path at (n-1, n-1).", "Unmark when backtracking."],
    T: "O(4^(n^2))", S: "O(n^2)",
  },
  "restore-ip-addresses": {
    k: "Backtrack four segments, each 1-3 digits between 0 and 255 with no leading zeros.",
    s: ["At each step try lengths 1, 2, 3.", "Reject values above 255 and multi-digit values starting with '0'.", "Accept when 4 segments use the whole string."],
    T: "O(3^4)", S: "O(1)",
  },
  "combinations": {
    k: "Backtrack choosing numbers in increasing order until k are chosen.",
    s: ["From start, try i up to n - (k - path size) + 1.", "Add i, recurse with i + 1, remove.", "Record at size k."],
    T: "O(C(n, k) * k)", S: "O(k)",
  },
  "combination-sum-iii": {
    k: "Choose k distinct digits 1-9 in increasing order that sum to n.",
    s: ["Backtrack from start digit with the remaining sum.", "Prune when the digit exceeds the remainder.", "Record when size is k and the remainder is 0."],
    T: "O(C(9, k))", S: "O(k)",
  },
  "m-coloring-problem": {
    k: "Backtrack assigning each vertex a colour unused by its neighbours.",
    s: ["For vertex v, try colours 1..m.", "Check no adjacent vertex has that colour.", "Recurse to v + 1; undo on failure."],
    T: "O(m^V)", S: "O(V)",
  },
  "knights-tour": {
    k: "BFS from the knight's square over the 8 knight moves; the level at the target is the answer.",
    s: ["Queue the start with distance 0.", "Push each on-board unvisited knight move with distance + 1.", "Return the distance on reaching the target."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "expression-add-operators": {
    k: "Backtrack over operand splits, keeping the current value and the last multiplied term to undo precedence.",
    s: ["Try every next operand, skipping multi-digit numbers with a leading zero.", "+: value + x, last = x. -: value - x, last = -x.", "*: value - last + last * x, last = last * x."],
    w: "Use 64-bit values; intermediate products overflow 32 bits.",
    T: "O(4^n)", S: "O(n)",
  },
  "beautiful-arrangement": {
    k: "Backtrack filling positions with unused numbers that satisfy the divisibility rule.",
    s: ["At position pos, try each unused i where i % pos == 0 or pos % i == 0.", "Recurse to pos + 1.", "Count completions; filling from the back prunes more."],
    T: "O(k) valid arrangements", S: "O(n)",
  },
  "kth-permutation-sequence": {
    s: ["Use k - 1, zero-based.", "Each leading digit fixes a block of (n - 1)! permutations.", "Pick index k / (n - 1)!, remove it, continue with k % (n - 1)!."],
  },
  "tower-of-hanoi": {
    s: ["Move n - 1 disks from source to helper.", "Move the largest disk to the target.", "Move n - 1 disks from helper to target; 2^n - 1 moves."],
  },
  "print-all-subsequences-sum-k": {
    k: "Every element is either taken or skipped; collect the sum of each of the 2^n choices.",
    s: ["recurse(i, sum): at i == n, record sum.", "Call recurse(i + 1, sum + a[i]) and recurse(i + 1, sum).", "Sort the result if required."],
    T: "O(2^n)", S: "O(n)",
  },
  "implement-trie-prefix-tree": {
    s: ["Each node has children (26 slots or a map) and an end flag.", "insert walks or creates nodes, then marks the end.", "search needs the end flag; startsWith does not."],
  },
  "design-add-and-search-words-data-structure": {
    s: ["Trie for the words.", "'.' tries every child recursively.", "Normal letters follow one edge."],
  },
  "maximum-xor-of-two-numbers": {
    s: ["Insert every number's bits into a binary trie, high bit first.", "For each number, greedily walk the opposite bit when it exists.", "Track the best XOR."],
  },
  "replace-words": {
    k: "Trie of roots; replace each word with the shortest root found along its path.",
    s: ["Insert every root.", "For each word, walk the trie and stop at the first end marker.", "Use that prefix, or the word if none."],
    T: "O(total chars)", S: "O(root chars)",
  },
  "search-suggestions-system": {
    k: "Sort products, then binary search each typed prefix and take the next three that match.",
    s: ["Sort the products.", "For each prefix, lower_bound to the first product >= prefix.", "Take up to three that start with the prefix. (A trie with top-3 lists also works.)"],
    T: "O(n log n + L log n)", S: "O(1) extra",
  },
  "camelcase-matching": {
    k: "Two pointers: pattern characters must appear in order, and every extra character must be lowercase.",
    s: ["Walk the query with j on the pattern.", "Match advances j; an unmatched uppercase fails.", "True if j reached the end of the pattern."],
    T: "O(total chars)", S: "O(1)",
  },
  "count-distinct-substrings": {
    k: "Insert every suffix into a trie; each new node created is one new distinct substring.",
    s: ["For each start i, walk the trie from the root along s[i..].", "Create nodes as needed and count them.", "Add 1 for the empty string if required."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "phone-directory-trie": {
    k: "Trie of contacts; for each prefix typed, list every contact under that node in sorted order.",
    s: ["Insert all contacts.", "Walk the query one char at a time.", "At each node, DFS to collect words (sorted), or '0' once the path breaks."],
    T: "O(total chars + output)", S: "O(total chars)",
  },
  "single-number": {
    s: ["XOR every number.", "Pairs cancel to 0.", "The leftover is the single one."],
  },
  "single-number-ii": {
    k: "Count each bit position mod 3; the bits left over form the single number.",
    s: ["For each of 32 bits, sum that bit over all numbers.", "If sum % 3 is 1, set that bit in the answer.", "Fix the sign for 32-bit negatives."],
    T: "O(32n)", S: "O(1)",
  },
  "single-number-iii": {
    s: ["XOR everything to get a ^ b.", "Take the lowest set bit; a and b differ there.", "Split the numbers by that bit and XOR each group."],
  },
  "number-of-1-bits": {
    s: ["n & (n - 1) clears the lowest set bit.", "Count how many times until n is 0.", "Or shift and test each of the 32 bits."],
  },
  "counting-bits": {
    s: ["bits[0] = 0.", "bits[i] = bits[i >> 1] + (i & 1).", "One pass up to n."],
  },
  "reverse-bits": {
    k: "Shift bits out of n and into the result 32 times.",
    s: ["result = (result << 1) | (n & 1).", "n >>= 1 (unsigned).", "Repeat 32 times."],
    T: "O(32)", S: "O(1)",
  },
  "missing-number": {
    s: ["XOR all indices 0..n and all values.", "Everything present cancels.", "Or n(n + 1)/2 - sum."],
  },
  "sum-of-two-integers": {
    s: ["a ^ b is the sum without carries.", "(a & b) << 1 is the carry.", "Repeat until the carry is 0 (mask to 32 bits in languages with big ints)."],
  },
  "power-of-two": {
    s: ["n must be positive.", "A power of two has one set bit.", "So n & (n - 1) == 0."],
  },
  "divide-two-integers": {
    s: ["Handle INT_MIN / -1 overflow first.", "Work with negatives or 64-bit absolute values.", "Subtract the largest shifted divisor that fits, adding 1 << shift to the quotient."],
  },
  "subsets-using-bitmask": {
    k: "Every mask 0..2^n - 1 is a subset; bit i says whether nums[i] is in it.",
    s: ["Loop mask from 0 to (1 << n) - 1.", "Include nums[i] if mask has bit i set.", "Collect each subset."],
    T: "O(n * 2^n)", S: "O(n)",
  },
  "xor-of-numbers-in-range": {
    k: "XOR of 1..n follows a period-4 pattern; XOR(l..r) = f(r) ^ f(l - 1).",
    s: ["f(n) by n % 4: 0 -> n, 1 -> 1, 2 -> n + 1, 3 -> 0.", "Answer = f(r) ^ f(l - 1)."],
    T: "O(1)", S: "O(1)",
  },
  "bitwise-and-of-numbers-range": {
    k: "The answer is the common binary prefix of left and right.",
    s: ["Shift both right until they are equal, counting shifts.", "Shift the common value back left by that count."],
    T: "O(log n)", S: "O(1)",
  },
  "minimum-flips": {
    k: "Count the set bits of start XOR goal.",
    s: ["x = start ^ goal.", "Count its 1 bits."],
    T: "O(log n)", S: "O(1)",
  },
  "gray-code": {
    k: "The ith Gray code is i ^ (i >> 1).",
    s: ["For i from 0 to 2^n - 1, output i ^ (i >> 1).", "Consecutive values differ by exactly one bit."],
    T: "O(2^n)", S: "O(1) extra",
  },
  "reverse-integer": {
    s: ["Pop the last digit with % 10 and push it onto the result.", "Before multiplying by 10, check the result would stay in 32-bit range.", "Return 0 on overflow."],
  },
  "palindrome-number": {
    k: "Reverse only the second half of the digits and compare it with the first half.",
    s: ["Negatives, and non-zero numbers ending in 0, are false.", "While x > rev, move the last digit of x into rev.", "Equal, or equal after dropping rev's middle digit, means palindrome."],
    T: "O(log n)", S: "O(1)",
  },
  "powx-n": {
    s: ["Fast exponentiation: square x and halve n.", "Multiply into the result when n is odd.", "For negative n, use 1/x with -n (in 64-bit)."],
    w: "-INT_MIN overflows 32 bits.",
  },
  "sieve-of-eratosthenes": {
    s: ["Mark everything prime.", "For each prime p with p * p <= n, cross off p*p, p*p + p, ...", "The remaining marks are primes."],
  },
  "count-primes": {
    k: "Sieve of Eratosthenes below n and count what survives.",
    s: ["isPrime array of size n, with 0 and 1 false.", "Cross off multiples starting at p * p.", "Count the trues."],
    w: "Primes strictly less than n, not up to n.",
    T: "O(n log log n)", S: "O(n)",
  },
  "gcd-euclid": {
    s: ["gcd(a, b) = gcd(b, a mod b).", "Stop when b is 0; a is the answer.", "lcm = a / gcd * b."],
  },
  "modular-exponentiation": {
    k: "Binary exponentiation, reducing mod m after every multiplication.",
    s: ["result = 1, base = x mod m.", "If the exponent is odd, result = result * base mod m.", "Square the base, halve the exponent."],
    w: "Products of two values below m can overflow 64 bits if m is large; use 128-bit or mulmod.",
    T: "O(log n)", S: "O(1)",
  },
  "factorial-trailing-zeroes": {
    s: ["Each trailing zero needs a factor of 5 (2s are plentiful).", "Count n/5 + n/25 + n/125 + ...", "Stop when the divisor exceeds n."],
  },
  "excel-sheet-column-number": {
    k: "Base 26 with digits A = 1 to Z = 26.",
    s: ["result = result * 26 + (c - 'A' + 1) for each char."],
    T: "O(n)", S: "O(1)",
  },
  "add-digits": {
    k: "Digital root: 0 for 0, otherwise 1 + (n - 1) % 9.",
    s: ["Return n == 0 ? 0 : 1 + (n - 1) % 9."],
    T: "O(1)", S: "O(1)",
  },
  "fizz-buzz": {
    k: "Check divisibility by 15 first, then 3, then 5.",
    s: ["For i in 1..n, build 'Fizz' / 'Buzz' / 'FizzBuzz' or the number."],
    T: "O(n)", S: "O(1) extra",
  },
  "random-pick-with-weight": {
    s: ["Build prefix sums of the weights.", "Draw r uniformly in [1, total].", "Binary search the first prefix >= r."],
  },
  "shuffle-an-array": {
    s: ["Fisher-Yates: for i from n - 1 down to 1.", "Pick j uniformly in [0, i] and swap a[i], a[j].", "Keep the original for reset."],
    w: "Picking j from the whole array every time is biased.",
  },
  "water-jug": {
    k: "Bezout: possible iff target <= x + y and target is a multiple of gcd(x, y).",
    s: ["If target > x + y, false.", "Return target % gcd(x, y) == 0."],
    T: "O(log min(x, y))", S: "O(1)",
  },
  "josephus-problem": {
    k: "J(n, k) = (J(n - 1, k) + k) mod n, with J(1) = 0.",
    s: ["res = 0.", "For i from 2 to n: res = (res + k) % i.", "Return res + 1 for 1-based."],
    T: "O(n)", S: "O(1)",
  },
  "unique-binary-search-trees": {
    s: ["Each root i splits into i - 1 left nodes and n - i right nodes.", "G(n) = sum over roots of G(left) * G(right).", "These are the Catalan numbers."],
  },
  "design-twitter": {
    s: ["Map user -> followees and user -> tweets with a global timestamp.", "getNewsFeed merges the recent tweets of self and followees with a heap.", "Stop at ten."],
  },
  "design-hashmap": {
    s: ["Fixed array of buckets.", "Each bucket is a list of (key, value).", "Hash with key mod the bucket count; replace on an existing key."],
  },
  "design-underground-system": {
    k: "Map id -> (station, time) for check-ins, and map (start, end) -> (total time, count).",
    s: ["checkIn stores the station and time.", "checkOut adds the trip duration to the route's total and count.", "Average = total / count."],
    T: "O(1)", S: "O(n)",
  },
  "design-hit-counter": {
    k: "Queue of timestamps; drop those older than 300 seconds before counting.",
    s: ["hit: push the timestamp.", "getHits: pop from the front while <= t - 300.", "Return the queue size. (Circular 300-slot buckets for many hits.)"],
    T: "O(1) amortised", S: "O(hits in window)",
  },
  "design-file-system": {
    k: "A trie of path parts where each node is a directory or a file with content.",
    s: ["Split the path on '/' and walk or create nodes.", "ls returns the file's own name, or the sorted children of a directory.", "addContentToFile appends; readContentFromFile reads."],
    T: "O(path length)", S: "O(total)",
  },
  "design-tic-tac-toe": {
    k: "Keep row, column and diagonal sums, +1 for player 1 and -1 for player 2.",
    s: ["move adds to rows[r], cols[c], and the diagonals if on them.", "If any absolute value reaches n, that player wins.", "O(1) per move."],
    T: "O(1)", S: "O(n)",
  },
  "snapshot-array": {
    k: "Each index stores a list of (snapId, value); get binary searches the latest snap <= id.",
    s: ["set appends or overwrites the entry for the current snap.", "snap returns snapId++.", "get: upper_bound on snapId, take the previous entry (or 0)."],
    T: "O(log s) per get", S: "O(sets)",
  },
  "design-rate-limiter": {
    k: "Map message -> last printed time; allow if 10 seconds have passed.",
    s: ["If the message is unseen or t - last >= 10, update and return true.", "Otherwise return false."],
    T: "O(1)", S: "O(messages)",
  },
  "all-oone-data-structure": {
    k: "Doubly linked list of count buckets (each holding keys) plus a map key -> bucket.",
    s: ["inc moves the key to the next bucket, creating count + 1 if needed.", "dec moves it to the previous bucket or removes it at 0.", "Remove empty buckets; max is the tail, min is the head."],
    T: "O(1)", S: "O(n)",
  },
  "design-a-stack-with-increment": {
    k: "Lazy increments: inc[i] applies to the bottom i + 1 elements and is pushed down on pop.",
    s: ["increment(k, val): inc[min(k, size) - 1] += val.", "pop: result = stack[i] + inc[i]; carry inc[i] into inc[i - 1].", "Clear inc[i]."],
    T: "O(1)", S: "O(n)",
  },
  "segment-tree-build": {
    s: ["Build a tree where each node stores its range's sum.", "Update a leaf and recompute sums up the path.", "Query combines O(log n) nodes covering the range. (A Fenwick tree also works.)"],
  },
  "count-of-smaller-numbers-after-self": {
    s: ["Merge sort over indices.", "When taking from the left half, add the count of right-half elements already taken.", "Or walk from the right with a Fenwick tree over ranks."],
  },
  "range-minimum-query": {
    k: "Sparse table: st[j][i] = min of the 2^j elements starting at i; a query uses two overlapping blocks.",
    s: ["st[0] = the array; st[j][i] = min(st[j-1][i], st[j-1][i + 2^(j-1)]).", "For [l, r], k = floor(log2(r - l + 1)).", "Answer = min(st[k][l], st[k][r - 2^k + 1])."],
    T: "O(n log n) build, O(1) query", S: "O(n log n)",
  },
  "lca-binary-lifting": {
    k: "up[j][v] = the 2^j-th ancestor; lift the deeper node, then lift both while their ancestors differ.",
    s: ["DFS for depth and up[0]; up[j][v] = up[j-1][up[j-1][v]].", "Lift u to v's depth using the bits of the difference.", "If not equal, for j from high to low, jump both when up[j] differs; answer is up[0][u]."],
    T: "O(n log n) build, O(log n) query", S: "O(n log n)",
  },
  "sliding-window-maximum-segment-tree": {
    k: "Build a max segment tree and query each window range.",
    s: ["Build over the array.", "For each i from 0 to n - k, query max on [i, i + k - 1].", "(The deque solution is O(n); this is practice for range queries.)"],
    T: "O(n log n)", S: "O(n)",
  },
  "disjoint-set-union-rank": {
    s: ["parent[i] = i, rank[i] = 0.", "find compresses the path to the root.", "union attaches the lower-rank root under the higher one."],
  },
  "kruskal-mst": {
    k: "Sort edges by weight and add each one that joins two different components.",
    s: ["Sort edges ascending.", "Union-find: add the edge if find(u) != find(v).", "Stop after V - 1 edges."],
    T: "O(E log E)", S: "O(V)",
  },
  "matrix-exponentiation-fib": {
    k: "[[1,1],[1,0]]^n holds F(n+1), F(n) and F(n-1); raise it by squaring.",
    s: ["Write 2x2 matrix multiply mod m.", "Binary exponentiation on the matrix.", "F(n) is the top-right entry."],
    T: "O(log n)", S: "O(1)",
  },
};
