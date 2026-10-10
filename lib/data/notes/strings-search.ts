import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/strings-search.ts. */
export const STRINGS_SEARCH_NOTES: NoteBook = {
  "valid-parentheses": {
    s: ["Push opening brackets.", "On a closer, the stack top must be its matching opener.", "Valid only if the stack ends empty."],
    w: "A closer on an empty stack is invalid, not a crash.",
  },
  "valid-palindrome": {
    s: ["Two pointers from both ends.", "Skip non-alphanumeric characters.", "Compare lowercased characters."],
  },
  "valid-palindrome-ii": {
    s: ["Two pointers until the first mismatch.", "Try skipping the left char or the right char.", "Either remainder being a palindrome is enough."],
  },
  "longest-palindromic-substring": {
    s: ["Expand around each centre, 2n - 1 of them.", "Odd centres at i, even centres between i and i+1.", "Track the longest span."],
  },
  "palindromic-substrings": {
    s: ["Expand around every centre.", "Each successful expansion is one more palindrome.", "Sum over all centres."],
  },
  "longest-repeating-character-replacement": {
    s: ["Window with letter counts and maxCount of any letter.", "If window length - maxCount > k, shrink from the left.", "Track the largest window."],
    w: "maxCount does not need to decrease when shrinking; the answer only grows with it.",
  },
  "minimum-window-substring": {
    s: ["Count what t needs and track how many requirements are satisfied.", "Expand right until all are satisfied.", "Shrink left while still valid, recording the smallest window."],
  },
  "longest-common-prefix": {
    k: "Compare characters column by column until any string differs or ends.",
    s: ["Take the first string as reference.", "For each index i, check every string has the same char at i.", "Stop at the first mismatch."],
    T: "O(total chars)", S: "O(1)",
  },
  "find-first-occurrence-in-string": {
    s: ["Try each start position i.", "Compare the needle character by character.", "KMP gives O(n + m) if needed."],
  },
  "string-to-integer-atoi": {
    s: ["Skip leading spaces.", "Read an optional sign.", "Read digits, clamping to the 32-bit range before overflowing."],
    w: "Check overflow before multiplying by 10, not after.",
  },
  "reverse-words-in-a-string": {
    s: ["Split on whitespace, dropping empty tokens.", "Reverse the list.", "Join with single spaces."],
  },
  "roman-to-integer": {
    s: ["Map each symbol to its value.", "If a value is smaller than the next one, subtract it.", "Otherwise add it."],
  },
  "integer-to-roman": {
    k: "Greedy over the 13 value-symbol pairs, including the subtractive ones like 900 = CM.",
    s: ["List values from 1000 down to 1 with CM, CD, XC, XL, IX, IV included.", "While num >= value, append the symbol and subtract."],
    T: "O(1)", S: "O(1)",
  },
  "zigzag-conversion": {
    k: "Simulate the zigzag by appending each character to its row while bouncing between the top and bottom.",
    s: ["One buffer per row.", "Move down until the last row, then up until row 0.", "Concatenate the rows."],
    w: "numRows = 1 must return the string unchanged.",
    T: "O(n)", S: "O(n)",
  },
  "count-and-say": {
    k: "Build each term by run-length encoding the previous one.",
    s: ["Start from '1'.", "Group equal consecutive digits.", "Write count then digit for each group; repeat n-1 times."],
    T: "O(total length)", S: "O(length)",
  },
  "multiply-strings": {
    s: ["Result array of size n + m.", "Digit i times digit j adds to position i + j + 1.", "Propagate carries and strip leading zeros."],
  },
  "add-binary": {
    k: "Add from the right with a carry, like column addition.",
    s: ["Pointers at both ends.", "sum = bits + carry; append sum % 2; carry = sum / 2.", "Reverse at the end."],
    T: "O(n + m)", S: "O(n + m)",
  },
  "compare-version-numbers": {
    k: "Split on dots and compare revisions as integers, treating missing ones as 0.",
    s: ["Split both strings.", "For i up to the longer length, parse or default to 0.", "Return at the first difference."],
    T: "O(n + m)", S: "O(n + m)",
  },
  "decode-string": {
    s: ["Stack of (previous string, repeat count).", "On '[' push and reset; on ']' pop and append current * count.", "Digits may be multi-digit."],
  },
  "basic-calculator-ii": {
    s: ["Keep the last operator and a stack.", "On + or - push the number (negated for -).", "On * or / combine with the top immediately; sum the stack at the end."],
    w: "Integer division truncates toward zero, including for negatives.",
  },
  "basic-calculator": {
    k: "Running result with a sign, and a stack that saves result and sign at each '('.",
    s: ["Accumulate numbers with the current sign into result.", "On '(' push result and sign, then reset.", "On ')' result = pushedResult + pushedSign * result."],
    T: "O(n)", S: "O(n)",
  },
  "text-justification": {
    k: "Greedily pack words per line, then spread the extra spaces left-heavy.",
    s: ["Add words while letters + gaps fit maxWidth.", "Spaces per gap = extra / gaps, with the first extra % gaps gaps getting one more.", "Last line and single-word lines are left-justified and padded."],
    T: "O(total chars)", S: "O(maxWidth)",
  },
  "group-shifted-strings": {
    k: "Key each string by the differences between consecutive letters, mod 26.",
    s: ["key = list of (s[i] - s[i-1] + 26) % 26.", "Group strings by key in a map."],
    T: "O(total chars)", S: "O(total chars)",
  },
  "repeated-substring-pattern": {
    s: ["Double the string and drop the first and last characters.", "If s still appears, it is built from a repeated block.", "Or check divisors of n directly."],
  },
  "shortest-palindrome": {
    k: "Find the longest palindromic prefix with KMP on s + '#' + reverse(s), then prepend the reversed rest.",
    s: ["Build t = s + '#' + reverse(s).", "LPS of the last position is the longest palindromic prefix.", "Answer = reverse(s[len..]) + s."],
    T: "O(n)", S: "O(n)",
  },
  "rabin-karp": {
    s: ["Rolling hash of the pattern and of each window.", "Slide: remove the leading char, shift, add the new one, mod a prime.", "On a hash match, verify characters."],
    w: "Skipping the verification makes collisions count as matches.",
  },
  "kmp-algorithm": {
    s: ["Build LPS: longest proper prefix that is also a suffix for each prefix.", "Scan the text; on mismatch fall back j = lps[j-1] instead of restarting.", "A full match at j = m records a hit."],
  },
  "minimum-characters-for-palindrome": {
    k: "Answer = n - longest palindromic prefix, found with the LPS array of s + '$' + reverse(s).",
    s: ["Build s + '$' + reverse(s).", "Compute the LPS array.", "Answer = n - lps[last]."],
    T: "O(n)", S: "O(n)",
  },
  "string-compression": {
    k: "Read pointer over runs, write pointer for the compressed output in place.",
    s: ["For each run, write the char.", "If the run is longer than 1, write its count digit by digit.", "Return the write pointer."],
    T: "O(n)", S: "O(1)",
  },
  "excel-sheet-column-title": {
    k: "Bijective base 26: subtract one before each mod.",
    s: ["While n > 0: n--, prepend 'A' + n % 26, n /= 26."],
    w: "Without the n-- step, 26 comes out as 'A@' instead of 'Z'.",
    T: "O(log n)", S: "O(1)",
  },
  "valid-number": {
    k: "Scan once with flags for seen digit, seen dot and seen exponent.",
    s: ["Sign only at the start or right after e/E.", "Dot only before any exponent and only once.", "Exponent needs digits before it, and resets seenDigit so digits must follow."],
    T: "O(n)", S: "O(1)",
  },
  "one-edit-distance": {
    k: "Find the first difference, then compare the remainders based on which is longer.",
    s: ["Ensure s is the shorter one; lengths may differ by at most 1.", "At the first mismatch: same length compares s[i+1:] with t[i+1:]; else s[i:] with t[i+1:].", "No mismatch: true only if lengths differ by 1."],
    T: "O(n)", S: "O(1)",
  },
  "longest-substring-with-at-most-k-distinct": {
    k: "Variable window with a count map; shrink when it holds more than k keys.",
    s: ["Add right char to the map.", "While map size > k, remove left char (deleting zeros).", "Record the window length."],
    T: "O(n)", S: "O(k)",
  },
  "permutation-in-string": {
    k: "Fixed window of len(s1) over s2, comparing letter counts.",
    s: ["Count s1.", "Slide a window of the same length over s2, updating counts.", "Equal counts at any position means true."],
    T: "O(n)", S: "O(1)",
  },
  "sliding-window-maximum": {
    s: ["Deque of indices with decreasing values.", "Pop the back while it is smaller than the new value.", "Pop the front once it leaves the window; front is the max."],
  },
  "fruit-into-baskets": {
    k: "Longest window holding at most two distinct values.",
    s: ["Count map over the window.", "Shrink from the left while there are more than 2 types.", "Track the max length."],
    T: "O(n)", S: "O(1)",
  },
  "max-consecutive-ones-iii": {
    k: "Longest window containing at most k zeros.",
    s: ["Count zeros as the window grows.", "While zeros > k, move left and drop its zero.", "Track the max length."],
    T: "O(n)", S: "O(1)",
  },
  "subarrays-with-k-different-integers": {
    s: ["exactly(k) = atMost(k) - atMost(k - 1).", "atMost uses a window and adds right - left + 1 each step.", "Shrink while distinct > k."],
  },
  "minimum-window-subsequence": {
    k: "Scan forward to match t as a subsequence, then scan backward from the end to tighten the start.",
    s: ["Move forward through s matching t until fully matched at end.", "Walk backward from end matching t in reverse to find start.", "Record the window and restart forward from start + 1."],
    T: "O(n * m)", S: "O(1)",
  },
  "count-number-of-nice-subarrays": {
    k: "Exactly k odds = atMost(k) - atMost(k - 1), or prefix counts of odd numbers.",
    s: ["Map number of odds seen -> frequency, with 0 -> 1.", "At each index add freq[odds - k].", "Increment freq[odds]."],
    T: "O(n)", S: "O(n)",
  },
  "longest-repeating-subsequence": {
    k: "LCS of the string with itself, forbidding matches at the same index.",
    s: ["dp[i][j] over prefixes of s and s.", "If s[i-1] == s[j-1] and i != j, dp = 1 + diagonal.", "Else the max of top and left."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "longest-duplicate-substring": {
    k: "Binary search the length; check each length with a rolling hash set.",
    s: ["Lengths are monotonic: a duplicate of length L implies one of L-1.", "For a length, hash every window and look for repeats.", "Verify on collisions, or use two moduli."],
    T: "O(n log n)", S: "O(n)",
  },
  "remove-all-adjacent-duplicates-ii": {
    k: "Stack of (char, run count); pop when a run reaches k.",
    s: ["If the char matches the top, increment its count, else push (char, 1).", "When count hits k, pop.", "Rebuild the string from the stack."],
    T: "O(n)", S: "O(n)",
  },
  "binary-search": {
    s: ["lo = 0, hi = n - 1.", "mid = lo + (hi - lo) / 2.", "Move toward the target; stop when lo > hi."],
  },
  "search-in-rotated-sorted-array": {
    s: ["One half around mid is always sorted.", "If the target lies inside the sorted half, search it.", "Otherwise search the other half."],
    w: "Use <= when testing whether the left half is sorted, for the two-element case.",
  },
  "search-in-rotated-sorted-array-ii": {
    k: "Same as the rotated search, but when lo, mid and hi are equal you cannot tell the sorted half, so shrink both ends.",
    s: ["If nums[lo] == nums[mid] == nums[hi], lo++ and hi--.", "Else find the sorted half and narrow as usual."],
    w: "The worst case degrades to O(n) with many duplicates.",
    T: "O(log n), O(n) worst", S: "O(1)",
  },
  "find-minimum-in-rotated-sorted-array": {
    s: ["Compare mid with hi.", "nums[mid] > nums[hi]: the minimum is right of mid.", "Otherwise it is at mid or left; hi = mid."],
  },
  "find-first-and-last-position": {
    s: ["Lower bound: first index with value >= target.", "Upper bound: first index with value > target, minus one.", "Check the found index actually holds the target."],
  },
  "search-insert-position": {
    k: "Lower bound: the first index whose value is >= target.",
    s: ["lo = 0, hi = n.", "If nums[mid] < target, lo = mid + 1, else hi = mid.", "Return lo."],
    T: "O(log n)", S: "O(1)",
  },
  "koko-eating-bananas": {
    s: ["Binary search the speed between 1 and max pile.", "Hours at speed k = sum of ceil(pile / k).", "Find the smallest k with hours <= h."],
  },
  "capacity-to-ship-packages": {
    k: "Binary search the capacity between the heaviest package and the total weight.",
    s: ["Check(cap): greedily fill days and count them.", "If days <= D, try smaller; else larger.", "Return the smallest feasible capacity."],
    T: "O(n log sum)", S: "O(1)",
  },
  "split-array-largest-sum": {
    s: ["Binary search the answer between max element and total.", "Greedily count pieces needed with each piece capped at mid.", "Pieces <= k means mid is feasible."],
  },
  "allocate-minimum-pages": {
    s: ["Binary search the maximum pages per student.", "Greedily assign books in order, starting a new student when over.", "Students needed <= m means feasible."],
    w: "If there are more students than books, the answer is -1.",
  },
  "aggressive-cows": {
    s: ["Sort stall positions.", "Binary search the minimum gap.", "Feasible if greedy placement fits at least c cows."],
  },
  "find-peak-element": {
    s: ["Compare mid with mid + 1.", "If rising, a peak lies to the right; else at mid or left.", "Converge on lo."],
  },
  "single-element-in-a-sorted-array": {
    s: ["Pairs start at even indices before the single element.", "Make mid even; if nums[mid] == nums[mid+1], go right by 2.", "Otherwise hi = mid."],
  },
  "kth-smallest-element-in-a-sorted-matrix": {
    k: "Binary search on the value range, counting cells <= mid with a staircase walk.",
    s: ["lo = matrix[0][0], hi = matrix[n-1][n-1].", "Count values <= mid from the bottom-left corner in O(n).", "count >= k: hi = mid; else lo = mid + 1."],
    T: "O(n log range)", S: "O(1)",
  },
  "find-kth-element-of-two-sorted-arrays": {
    k: "Binary search how many elements to take from the shorter array.",
    s: ["Take i from A and k - i from B.", "Valid when A[i-1] <= B[k-i] and B[k-i-1] <= A[i].", "Answer = max(A[i-1], B[k-i-1])."],
    w: "Clamp the search range: i is between max(0, k - m) and min(k, n).",
    T: "O(log min(n, m))", S: "O(1)",
  },
  "sqrtx": {
    s: ["Binary search r in 0..x.", "Find the largest r with r * r <= x.", "Compare using r <= x / r to avoid overflow."],
  },
  "nth-root-of-a-number": {
    k: "Binary search the integer root, computing mid^n with early exit once it passes m.",
    s: ["lo = 1, hi = m.", "Compute mid^n, stopping early if it exceeds m.", "Equal: return mid; smaller: go right; larger: go left. Return -1 if none."],
    T: "O(n log m)", S: "O(1)",
  },
  "search-in-infinite-sorted-array": {
    s: ["Start with hi = 1 and double it until arr[hi] >= target.", "Binary search between the previous hi and the new hi.", "O(log p) where p is the target's position."],
  },
  "minimum-in-rotated-with-duplicates": {
    k: "Rotated minimum search, but when nums[mid] == nums[hi] you can only drop hi by one.",
    s: ["nums[mid] > nums[hi]: lo = mid + 1.", "nums[mid] < nums[hi]: hi = mid.", "Equal: hi--."],
    T: "O(log n), O(n) worst", S: "O(1)",
  },
  "time-based-key-value-store": {
    s: ["Map key -> list of (timestamp, value), appended in order.", "get: binary search the largest timestamp <= t.", "Return '' if none."],
  },
  "find-median-from-data-stream": {
    s: ["Max-heap for the lower half, min-heap for the upper half.", "Push into lower, move its top to upper, rebalance so lower is never smaller.", "Median from the tops."],
  },
  "peak-index-in-a-mountain-array": {
    k: "Binary search on the slope: rising means the peak is to the right.",
    s: ["If arr[mid] < arr[mid+1], lo = mid + 1.", "Else hi = mid.", "Return lo."],
    T: "O(log n)", S: "O(1)",
  },
  "minimum-days-to-make-bouquets": {
    k: "Binary search the day; check by counting runs of k bloomed flowers.",
    s: ["If m * k > n, return -1.", "For a day d, scan and count bouquets from consecutive bloomDay <= d.", "Find the smallest d with bouquets >= m."],
    w: "m * k can overflow 32-bit integers.",
    T: "O(n log maxDay)", S: "O(1)",
  },
};
