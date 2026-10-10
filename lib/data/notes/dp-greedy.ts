import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/dp-greedy.ts. */
export const DP_GREEDY_NOTES: NoteBook = {
  "climbing-stairs": {
    s: ["f(1) = 1, f(2) = 2.", "f(n) = f(n-1) + f(n-2).", "Two rolling variables are enough."],
  },
  "min-cost-climbing-stairs": {
    k: "dp[i] = cost[i] + min(dp[i-1], dp[i-2]); the top can be reached from either of the last two steps.",
    s: ["dp[0] = cost[0], dp[1] = cost[1].", "Fill forward with the recurrence.", "Answer = min(dp[n-1], dp[n-2])."],
    T: "O(n)", S: "O(1)",
  },
  "house-robber": {
    s: ["Keep prev2 and prev1, the best totals two and one houses back.", "cur = max(prev1, prev2 + nums[i]).", "Shift and continue."],
  },
  "house-robber-ii": {
    s: ["The first and last houses are neighbours.", "Answer = max(rob(nums[0..n-2]), rob(nums[1..n-1])).", "With one house, return it."],
  },
  "coin-change": {
    s: ["dp[0] = 0, everything else infinity.", "For each amount a and coin c <= a: dp[a] = min(dp[a], dp[a-c] + 1).", "Return -1 if dp[amount] is still infinity."],
  },
  "coin-change-ii": {
    s: ["dp[0] = 1.", "Outer loop over coins, inner over amounts ascending: dp[a] += dp[a - coin].", "Coins outside counts combinations, not orderings."],
    w: "Swapping the loops counts permutations instead.",
  },
  "longest-increasing-subsequence": {
    s: ["tails[i] = smallest tail of an increasing run of length i + 1.", "For each x, binary search the first tail >= x and replace it (or append).", "Answer = tails length."],
    w: "tails is not itself a valid subsequence; only its length is meaningful.",
  },
  "longest-common-subsequence": {
    s: ["dp[i][j] for prefixes of length i and j.", "Equal chars: 1 + dp[i-1][j-1].", "Else max(dp[i-1][j], dp[i][j-1])."],
  },
  "word-break": {
    s: ["dp[0] = true.", "dp[i] = any j < i with dp[j] and s[j..i) in the set.", "Limit j to the longest word length for speed."],
  },
  "word-break-ii": {
    k: "Memoised DFS: for each start index, return every sentence that can be built from the suffix.",
    s: ["At index i, try every dictionary word that matches s starting at i.", "Recurse on the rest and prefix the word to each result.", "Memoise results by start index; the end index returns ['']."],
    T: "O(n * 2^n) worst", S: "O(n * 2^n)",
  },
  "combination-sum-iv": {
    s: ["dp[0] = 1.", "For each target t ascending, for each num <= t: dp[t] += dp[t - num].", "Targets outside counts ordered sequences."],
  },
  "decode-ways": {
    s: ["dp[0] = 1; dp[1] = 1 if s[0] != '0'.", "Add dp[i-1] if s[i-1] != '0'.", "Add dp[i-2] if s[i-2..i] is between 10 and 26."],
    w: "A leading '0' or a '0' after something other than 1 or 2 makes the count zero.",
  },
  "unique-paths": {
    s: ["Every cell in row 0 or column 0 has 1 path.", "dp[j] += dp[j-1] row by row.", "Or C(m + n - 2, m - 1)."],
  },
  "unique-paths-ii": {
    k: "Grid paths DP where obstacle cells contribute 0.",
    s: ["dp[0] = 1 if the start is open.", "For each cell: obstacle sets dp[j] = 0, else dp[j] += dp[j-1].", "Return dp[n-1]."],
    w: "An obstacle on the start cell means 0 paths.",
    T: "O(m * n)", S: "O(n)",
  },
  "jump-game": {
    s: ["Track the furthest index reachable.", "If i is ever beyond it, return false.", "Update reach = max(reach, i + nums[i])."],
  },
  "jump-game-ii": {
    s: ["BFS by ranges: the current jump covers [start, end].", "Track the furthest reach within the range.", "When i reaches end, take a jump and set end = furthest."],
  },
  "partition-equal-subset-sum": {
    s: ["If the total is odd, return false.", "Subset-sum to total / 2 with a boolean dp.", "Loop sums downward so each number is used once."],
  },
  "target-sum": {
    s: ["Positive set P satisfies P = (total + target) / 2.", "If that is not a non-negative integer, return 0.", "Count subsets summing to P with a 0/1 knapsack count."],
  },
  "zero-one-knapsack": {
    s: ["dp[w] = best value with capacity w.", "For each item, loop w from W down to weight.", "dp[w] = max(dp[w], dp[w - wt] + val)."],
    w: "Looping capacity upward lets an item be used twice.",
  },
  "unbounded-knapsack": {
    k: "Knapsack where each item may be reused, so the capacity loop runs upward.",
    s: ["dp[w] = best value with capacity w.", "For each item, loop w from weight up to W.", "dp[w] = max(dp[w], dp[w - wt] + val)."],
    T: "O(n * W)", S: "O(W)",
  },
  "rod-cutting": {
    k: "Unbounded knapsack where piece length i has value price[i].",
    s: ["dp[0] = 0.", "dp[len] = max over cuts i of price[i] + dp[len - i].", "Return dp[n]."],
    T: "O(n^2)", S: "O(n)",
  },
  "minimum-sum-partition": {
    k: "Find every reachable subset sum up to total / 2; the best is the closest to half.",
    s: ["Boolean subset-sum dp up to total / 2.", "Find the largest reachable s.", "Answer = total - 2s."],
    T: "O(n * total)", S: "O(total)",
  },
  "perfect-sum-problem": {
    k: "Count subsets that sum to the target with a 0/1 knapsack count.",
    s: ["dp[0] = 1.", "For each number, loop sums downward: dp[s] += dp[s - x].", "Return dp[target] mod 1e9+7."],
    w: "Zeros double the count; the downward loop handles them as long as the loop includes s = x = 0.",
    T: "O(n * sum)", S: "O(sum)",
  },
  "edit-distance": {
    s: ["dp[i][0] = i, dp[0][j] = j.", "Equal chars: dp[i-1][j-1].", "Else 1 + min(insert, delete, replace) from the three neighbours."],
  },
  "distinct-subsequences": {
    k: "dp[i][j] = ways to form t[0..j) from s[0..i).",
    s: ["dp[i][0] = 1 for all i.", "dp[i][j] = dp[i-1][j], plus dp[i-1][j-1] if s[i-1] == t[j-1].", "1D: loop j downward."],
    T: "O(n * m)", S: "O(m)",
  },
  "interleaving-string": {
    k: "dp[i][j] is whether s1[0..i) and s2[0..j) interleave into s3[0..i+j).",
    s: ["Lengths must add up.", "dp[i][j] = (dp[i-1][j] and s1[i-1] == s3[i+j-1]) or (dp[i][j-1] and s2[j-1] == s3[i+j-1]).", "dp[0][0] = true."],
    T: "O(n * m)", S: "O(m)",
  },
  "shortest-common-supersequence": {
    k: "Build the LCS table, then walk back from the end, emitting shared chars once and the others individually.",
    s: ["Fill the LCS dp.", "From (n, m): equal chars go in once diagonally; else take the char from the side with the larger dp.", "Append leftovers and reverse."],
    T: "O(n * m)", S: "O(n * m)",
  },
  "longest-palindromic-subsequence": {
    s: ["dp[i][j] over s[i..j].", "Equal ends: 2 + dp[i+1][j-1]; else max(dp[i+1][j], dp[i][j-1]).", "Fill i from the end so inner ranges are ready."],
  },
  "minimum-insertions-to-palindrome": {
    k: "Insertions = n - longest palindromic subsequence.",
    s: ["Compute the LPS (or LCS of s and reverse(s)).", "Return n - LPS."],
    T: "O(n^2)", S: "O(n)",
  },
  "regular-expression-matching": {
    s: ["dp[i][j]: does s[0..i) match p[0..j)?", "'*' means zero of the previous (dp[i][j-2]) or one more (if it matches, dp[i-1][j]).", "'.' matches any single char."],
    w: "Initialise row 0 so patterns like a*b* match the empty string.",
  },
  "wildcard-matching": {
    k: "dp[i][j] = s[0..i) matches p[0..j), where '*' matches empty (left) or one more char (up).",
    s: ["dp[0][j] is true while p is only '*'s.", "'*': dp[i][j-1] or dp[i-1][j].", "'?' or equal char: dp[i-1][j-1]."],
    T: "O(n * m)", S: "O(m)",
  },
  "maximal-square": {
    s: ["dp[i][j] = side of the largest square ending at (i, j).", "On a '1': 1 + min(top, left, top-left).", "Answer = max side squared."],
  },
  "minimum-path-sum": {
    k: "Each cell adds its value to the cheaper of the cell above or the cell to the left.",
    s: ["First row and column are prefix sums.", "dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).", "Return the bottom-right."],
    T: "O(m * n)", S: "O(n)",
  },
  "triangle": {
    k: "Bottom-up: each cell becomes itself plus the smaller of its two children.",
    s: ["Start with dp = last row.", "Move up: dp[j] = row[j] + min(dp[j], dp[j+1]).", "Answer = dp[0]."],
    T: "O(n^2)", S: "O(n)",
  },
  "dungeon-game": {
    s: ["Fill from the bottom-right corner backwards.", "need = max(1, min(right, down) - cell).", "The start cell's need is the answer."],
    w: "Forward DP fails because health must stay positive along the whole path.",
  },
  "cherry-pickup-ii": {
    k: "Both robots move down one row together; state is (row, col1, col2).",
    s: ["Gain = grid[r][c1] + grid[r][c2], counted once if c1 == c2.", "Try all 9 move combinations to the next row.", "Fill rows bottom-up, keeping only two layers."],
    T: "O(r * c^2 * 9)", S: "O(c^2)",
  },
  "matrix-chain-multiplication": {
    s: ["dp[i][j] = min cost to multiply matrices i..j.", "Try every split k: dp[i][k] + dp[k+1][j] + dims[i-1]*dims[k]*dims[j].", "Fill by increasing chain length."],
  },
  "burst-balloons": {
    s: ["Pad the array with 1 at both ends.", "dp[l][r]: choose k as the last balloon burst between l and r.", "Value = nums[l] * nums[k] * nums[r] + dp[l][k] + dp[k][r]."],
    w: "Think of the last balloon to burst, not the first, so the two halves are independent.",
  },
  "palindrome-partitioning-ii": {
    k: "Precompute which substrings are palindromes, then cuts[i] = min over palindromic s[j..i] of cuts[j-1] + 1.",
    s: ["Fill isPal[j][i] by expanding or with DP.", "cuts[i] = 0 if s[0..i] is a palindrome.", "Else take the min of cuts[j-1] + 1 over palindromic s[j..i]."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "stone-game": {
    k: "With an even number of piles the first player can always take all even or all odd indices, so Alice always wins.",
    s: ["Return true.", "The general version: dp[i][j] = max(p[i] - dp[i+1][j], p[j] - dp[i][j-1]) > 0."],
    T: "O(1)", S: "O(1)",
  },
  "best-time-to-buy-and-sell-stock-with-cooldown": {
    s: ["Three states: hold, sold today, rest.", "hold = max(hold, rest - p); sold = hold + p; rest = max(rest, prevSold).", "Answer = max(sold, rest)."],
  },
  "best-time-to-buy-and-sell-stock-iv": {
    k: "buy[j] and sell[j] for each of k transactions, updated per day.",
    s: ["If k >= n / 2, sum every rising step.", "buy[j] = max(buy[j], sell[j-1] - p).", "sell[j] = max(sell[j], buy[j] + p). Answer = sell[k]."],
    T: "O(n * k)", S: "O(k)",
  },
  "best-time-with-transaction-fee": {
    k: "Two states, holding and not holding, with the fee paid on sale.",
    s: ["cash = max(cash, hold + p - fee).", "hold = max(hold, cash - p).", "Answer = cash."],
    T: "O(n)", S: "O(1)",
  },
  "number-of-longest-increasing-subsequence": {
    k: "Alongside the LIS length ending at i, keep how many subsequences reach that length.",
    s: ["len[i] = 1, cnt[i] = 1.", "For j < i with nums[j] < nums[i]: a longer length resets cnt[i] = cnt[j]; an equal length adds cnt[j].", "Sum cnt where len equals the max."],
    T: "O(n^2)", S: "O(n)",
  },
  "russian-doll-envelopes": {
    s: ["Sort by width ascending and height descending.", "Run LIS on heights with binary search.", "Descending heights stop equal widths from nesting."],
  },
  "longest-bitonic-subsequence": {
    k: "LIS ending at i plus LDS starting at i, minus 1, maximised over i.",
    s: ["lis[i] from the left.", "lds[i] from the right (decreasing).", "Answer = max(lis[i] + lds[i] - 1)."],
    T: "O(n^2)", S: "O(n)",
  },
  "travelling-salesman": {
    s: ["dp[mask][v] = cheapest path visiting mask and ending at v.", "Extend to an unvisited u: dp[mask | 1<<u][u].", "Close the tour back to the start; O(2^n * n^2)."],
  },
  "partition-to-k-equal-sum-subsets": {
    k: "Backtrack filling k buckets of size total / k, with sorting and symmetry pruning.",
    s: ["Total must divide by k; sort descending.", "Place each number into a bucket that has room.", "Skip buckets with the same current sum; stop after trying an empty bucket."],
    T: "O(k * 2^n) worst", S: "O(n)",
  },
  "count-square-submatrices": {
    k: "dp[i][j] = largest square ending at (i, j); summing all of them counts every square.",
    s: ["On a 1: dp = 1 + min(top, left, top-left).", "Add dp[i][j] to the total."],
    T: "O(m * n)", S: "O(1) in place",
  },
  "perfect-squares": {
    k: "Unbounded knapsack over square numbers: dp[n] = 1 + min dp[n - s*s].",
    s: ["dp[0] = 0.", "For each i, try every square s*s <= i.", "Return dp[n]."],
    T: "O(n sqrt n)", S: "O(n)",
  },
  "integer-break": {
    k: "Break into as many 3s as possible; a remainder of 1 becomes 2 + 2.",
    s: ["n = 2 gives 1, n = 3 gives 2.", "While n > 4, multiply by 3 and subtract 3.", "Multiply the remainder in."],
    T: "O(n)", S: "O(1)",
  },
  "ones-and-zeroes": {
    k: "0/1 knapsack with two capacities, zeros and ones.",
    s: ["dp[i][j] = most strings using i zeros and j ones.", "For each string, loop i and j downward.", "dp[i][j] = max(dp[i][j], 1 + dp[i - z][j - o])."],
    T: "O(L * m * n)", S: "O(m * n)",
  },
  "frog-jump": {
    k: "Map each stone to the set of jump sizes that can land on it.",
    s: ["stone 0 has jump {0}.", "For each stone and each k, try jumps k - 1, k, k + 1 > 0.", "If one lands on a stone, add that jump to its set. Reached the last stone?"],
    T: "O(n^2)", S: "O(n^2)",
  },
  "maximum-profit-in-job-scheduling": {
    s: ["Sort jobs by end time.", "dp[i] = max(dp[i-1], profit[i] + dp[last job ending at or before start i]).", "Find that previous job with binary search."],
  },
  "longest-arithmetic-subsequence": {
    k: "dp[i][diff] = length of the longest arithmetic run ending at i with that difference.",
    s: ["For each j < i, d = a[i] - a[j].", "dp[i][d] = dp[j][d] + 1 (default 2).", "Track the max."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "number-of-dice-rolls-with-target-sum": {
    k: "dp[d][t] = ways to reach t with d dice, each adding 1..k.",
    s: ["dp[0][0] = 1.", "dp[d][t] = sum of dp[d-1][t - f] for f = 1..k.", "Mod 1e9+7."],
    T: "O(n * target * k)", S: "O(target)",
  },
  "min-falling-path-sum": {
    k: "Each cell adds the minimum of the three cells above it.",
    s: ["Copy the first row.", "dp[i][j] = a[i][j] + min(dp[i-1][j-1], dp[i-1][j], dp[i-1][j+1]).", "Answer = min of the last row."],
    T: "O(n^2)", S: "O(n)",
  },
  "knight-probability-in-chessboard": {
    k: "dp[step][r][c] = probability of being on (r, c) after step moves.",
    s: ["dp[0][row][col] = 1.", "Each move spreads probability / 8 to the 8 on-board targets.", "Answer = total probability after k moves."],
    T: "O(k * n^2)", S: "O(n^2)",
  },
  "gas-station": {
    s: ["If total gas < total cost, return -1.", "Walk with a running tank; when it goes negative, start after this station.", "The last start chosen is the answer."],
  },
  "hand-of-straights": {
    k: "Greedy from the smallest card: it must start a group.",
    s: ["If n % groupSize != 0, return false.", "Count cards; repeatedly take the smallest remaining card x.", "Consume x..x+groupSize-1, failing if any is missing."],
    T: "O(n log n)", S: "O(n)",
  },
  "merge-triplets-to-form-target": {
    k: "Ignore any triplet exceeding the target anywhere; the rest must cover every target value.",
    s: ["Skip triplets with any value above the target.", "Mark which target positions a valid triplet matches exactly.", "True if all three are matched."],
    T: "O(n)", S: "O(1)",
  },
  "partition-labels": {
    s: ["Record the last index of every letter.", "Extend the current part's end to the max last index seen.", "Cut when i reaches end."],
  },
  "valid-parenthesis-string": {
    s: ["Track the range [lo, hi] of possible open counts.", "'(' raises both, ')' lowers both, '*' lowers lo and raises hi.", "Fail if hi < 0; clamp lo at 0; valid if lo == 0 at the end."],
  },
  "candy": {
    s: ["Everyone starts with 1.", "Left to right: higher than the left neighbour gets left + 1.", "Right to left: higher than the right neighbour gets max(current, right + 1)."],
  },
  "n-meetings-in-one-room": {
    s: ["Sort meetings by end time.", "Take a meeting if it starts after the last taken end.", "Count them."],
  },
  "job-sequencing-problem": {
    s: ["Sort jobs by profit descending.", "Place each in the latest free slot at or before its deadline.", "Use DSU to find free slots fast."],
  },
  "fractional-knapsack": {
    s: ["Sort by value / weight descending.", "Take whole items while they fit.", "Take a fraction of the next item to fill the rest."],
  },
  "minimum-platforms": {
    s: ["Sort arrivals and departures separately.", "An arrival before the next departure needs a platform.", "Track the max in use."],
    w: "Decide whether equal arrival and departure times share a platform, and use < or <= to match.",
  },
  "assign-cookies": {
    k: "Sort both; give the smallest cookie that satisfies the least greedy child.",
    s: ["Sort greed and sizes.", "Two pointers: if the cookie fits the child, both advance.", "Otherwise try the next cookie."],
    T: "O(n log n)", S: "O(1)",
  },
  "lemonade-change": {
    k: "Track $5 and $10 bills, and for $20 prefer giving a $10 + $5.",
    s: ["$5: keep it.", "$10: needs a $5.", "$20: use $10 + $5 if possible, else three $5s; fail otherwise."],
    T: "O(n)", S: "O(1)",
  },
  "minimum-number-of-coins": {
    k: "Canonical denominations make greedy optimal: always take the largest coin that fits.",
    s: ["Denominations descending.", "While amount >= coin, take it.", "Collect the coins used."],
    w: "Greedy is only optimal for canonical coin systems; arbitrary coins need DP.",
    T: "O(amount / smallest coin)", S: "O(1)",
  },
  "shortest-job-first": {
    k: "Run jobs in order of burst time; average waiting time is the sum of prefix sums divided by n.",
    s: ["Sort burst times.", "Waiting time of each job = sum of the bursts before it.", "Average (floor) the total."],
    T: "O(n log n)", S: "O(1)",
  },
  "queue-reconstruction-by-height": {
    k: "Sort by height descending (k ascending) and insert each person at index k.",
    s: ["Sort: taller first, ties by k ascending.", "Insert each person at position k.", "Shorter people placed later never disturb the taller ones' counts."],
    T: "O(n^2)", S: "O(n)",
  },
  "two-city-scheduling": {
    k: "Sort by cost difference to A minus B; send the first half to A and the rest to B.",
    s: ["Sort by aCost - bCost.", "First n go to A, the rest to B.", "Sum the costs."],
    T: "O(n log n)", S: "O(1)",
  },
};
