import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/core-arrays.ts. */
export const CORE_ARRAYS_NOTES: NoteBook = {
  "best-time-to-buy-and-sell-stock": {
    s: ["Track the lowest price seen so far.", "At each day, profit = price - lowest; keep the max.", "Update lowest after computing profit."],
    w: "You must buy before you sell, so never pair a price with a later minimum.",
  },
  "product-of-array-except-self": {
    s: ["Fill answer[i] with the product of everything left of i.", "Sweep from the right with a running suffix product and multiply it in.", "No division needed, so zeros are handled for free."],
    w: "Using division breaks on zeros and is usually disallowed.",
  },
  "maximum-subarray": {
    s: ["Keep cur = best sum of a subarray ending here.", "cur = max(x, cur + x), best = max(best, cur).", "Initialise with the first element, not 0."],
    w: "Starting best at 0 returns 0 for an all-negative array.",
  },
  "maximum-product-subarray": {
    s: ["Track both the max and min product ending here.", "A negative number swaps them, so compute from the old pair.", "Answer is the best max seen."],
    w: "Update max and min from the previous values at the same time, not one after the other.",
  },
  "merge-sorted-array": {
    s: ["Fill nums1 from the back with three pointers.", "Place the larger of nums1[i] and nums2[j] at position k.", "Copy any leftover nums2 elements."],
    w: "Leftover nums1 elements are already in place; only nums2 leftovers need copying.",
  },
  "remove-duplicates-from-sorted-array": {
    s: ["Write pointer k starts at 1.", "For each i, if nums[i] differs from nums[k-1], write it at k and advance.", "Return k."],
  },
  "rotate-array": {
    s: ["Take k = k mod n.", "Reverse the whole array.", "Reverse the first k, then the remaining n - k."],
    w: "Forgetting k mod n when k is larger than n.",
  },
  "move-zeroes": {
    s: ["Write pointer w marks where the next non-zero goes.", "Swap each non-zero into position w and advance w.", "Zeros drift to the end automatically."],
  },
  "majority-element": {
    s: ["Boyer-Moore: keep a candidate and a count.", "Count 0 means adopt the current element.", "Same element adds 1, different subtracts 1."],
    w: "The vote only works because a majority is guaranteed; verify if it is not.",
  },
  "majority-element-ii": {
    s: ["Run Boyer-Moore with two candidates and two counts.", "Match a candidate first, then fill an empty slot, else decrement both.", "Second pass: count both candidates and keep those above n/3."],
    w: "The verification pass is mandatory; candidates are only possibilities.",
  },
  "sort-colors": {
    s: ["Dutch flag: low, mid, high pointers.", "0 swaps with low (advance both), 1 just advances mid.", "2 swaps with high and decrements high, but mid stays put."],
    w: "Do not advance mid after swapping with high; the incoming value is unchecked.",
  },
  "next-permutation": {
    s: ["From the right, find the first i with nums[i] < nums[i+1].", "If found, swap it with the rightmost element larger than it.", "Reverse the suffix after i."],
    w: "If no such i exists, the whole array is reversed to the smallest order.",
  },
  "first-missing-positive": {
    s: ["Cyclic sort: put each value v in 1..n at index v-1 by swapping.", "Keep swapping at i until the value is out of range or already placed.", "First index i where nums[i] != i+1 gives i+1; else n+1."],
    w: "Guard against duplicates with nums[v-1] != v, or the swap loops forever.",
  },
  "find-the-duplicate-number": {
    s: ["Treat i -> nums[i] as a linked list; the duplicate is a cycle entry.", "Floyd: slow and fast meet inside the cycle.", "Reset one pointer to start; step both by one until they meet."],
  },
  "find-all-duplicates-in-an-array": {
    s: ["For each value v, look at index |v|-1.", "If that slot is already negative, v is a duplicate.", "Otherwise negate it to mark v as seen."],
    w: "Use the absolute value, since earlier marks may have negated the current entry.",
  },
  "find-all-numbers-disappeared": {
    k: "Use the array itself as a seen-set by negating the slot each value points to.",
    s: ["For each v, negate nums[|v|-1] if positive.", "Every index i still positive means i+1 never appeared.", "Collect those."],
    w: "Read |v|, not v, because the slot may already be negated.",
    T: "O(n)", S: "O(1)",
  },
  "set-mismatch": {
    k: "Mark seen values by negation; the slot found negative twice is the duplicate, the one never touched is missing.",
    s: ["For each v, check nums[|v|-1]: negative means v is the duplicate, else negate it.", "The index still positive gives the missing number.", "Return [duplicate, missing]."],
    w: "Sum formulas alone give one equation for two unknowns; you need the marks or a second equation.",
    T: "O(n)", S: "O(1)",
  },
  "max-consecutive-ones": {
    k: "One pass with a running streak that resets on zero.",
    s: ["cur++ on a 1, cur = 0 on a 0.", "best = max(best, cur) after each step."],
    T: "O(n)", S: "O(1)",
  },
  "plus-one": {
    s: ["Walk from the last digit.", "If it is below 9, add one and return.", "Otherwise set it to 0 and carry on; if all were 9s, prepend 1."],
  },
  "pascals-triangle": {
    k: "Each row starts and ends with 1 and every inner value is the sum of the two above it.",
    s: ["Start with [1].", "Row r: row[j] = prev[j-1] + prev[j] for 0 < j < r.", "Append 1 at both ends."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "best-time-to-buy-and-sell-stock-ii": {
    s: ["Unlimited trades means every rising step is profit.", "Sum max(0, prices[i] - prices[i-1]).", "This equals buying every valley and selling every peak."],
  },
  "best-time-to-buy-and-sell-stock-iii": {
    k: "At most two transactions: keep four states, buy1, sell1, buy2, sell2, updated per day.",
    s: ["buy1 = max(buy1, -p); sell1 = max(sell1, buy1 + p).", "buy2 = max(buy2, sell1 - p); sell2 = max(sell2, buy2 + p).", "Answer is sell2."],
    w: "Initialise buy states to minus infinity (or -prices[0]), not 0.",
    T: "O(n)", S: "O(1)",
  },
  "chocolate-distribution-problem": {
    s: ["Sort the packets.", "Slide a window of size m over the sorted array.", "Answer is the smallest a[i+m-1] - a[i]."],
  },
  "minimize-the-heights-ii": {
    k: "Sort, then try every split point: the left part goes up by k, the right part goes down by k.",
    s: ["Sort; start with answer = a[n-1] - a[0].", "For each i, low = min(a[0]+k, a[i+1]-k) and high = max(a[i]+k, a[n-1]-k).", "Skip splits where a[i+1]-k < 0; answer = min(high - low)."],
    w: "Heights must stay non-negative, so the subtract side cannot go below zero.",
    T: "O(n log n)", S: "O(1)",
  },
  "maximum-sum-circular-subarray": {
    s: ["Run Kadane for the max subarray.", "Run Kadane for the min subarray; circular best = total - min.", "Answer = max of the two, unless every number is negative (then the plain max)."],
    w: "If all values are negative, total - min is 0, which is an empty subarray and invalid.",
  },
  "rearrange-array-alternately": {
    k: "Write max, min, second max, second min, using two pointers into the sorted array.",
    s: ["Pointers at both ends of the sorted array.", "Alternate taking from the right and the left.", "For O(1) space, encode two values in one cell with a multiplier larger than the max."],
    T: "O(n)", S: "O(1) with encoding",
  },
  "kth-largest-element-in-an-array": {
    s: ["Keep a min-heap of size k; pop when it grows past k.", "The heap top is the answer.", "Or quickselect for average O(n)."],
    w: "Quickselect needs a random pivot or it degrades to O(n^2) on sorted input.",
  },
  "top-k-frequent-elements": {
    s: ["Count frequencies with a hash map.", "Bucket the values by frequency into an array of lists.", "Walk the buckets from high to low until you have k."],
  },
  "sort-an-array": {
    s: ["Use merge sort for a guaranteed O(n log n).", "Split, sort halves, merge with two pointers.", "Heap sort if O(1) extra space matters."],
    w: "Plain quicksort with a fixed pivot times out on sorted or all-equal input.",
  },
  "wiggle-sort-ii": {
    k: "Put the smaller half on even indices and the larger half on odd indices, both in reverse order.",
    s: ["Sort a copy.", "Fill even indices from the middle going down, odd indices from the end going down.", "Reverse order stops equal middle values from touching."],
    w: "Filling in ascending order puts equal median values next to each other.",
    T: "O(n log n)", S: "O(n)",
  },
  "minimum-size-subarray-sum": {
    s: ["Grow the window on the right, adding to sum.", "While sum >= target, record the length and shrink from the left.", "Return 0 if never reached."],
  },
  "spiral-matrix": {
    s: ["Keep top, bottom, left, right bounds.", "Walk right, down, left, up, shrinking the bound after each side.", "Check bounds before the left and up walks."],
    w: "Without the re-check, single rows or columns are printed twice.",
  },
  "rotate-image": {
    s: ["Transpose: swap m[i][j] with m[j][i] for j > i.", "Reverse each row.", "That is a clockwise rotation in place."],
  },
  "set-matrix-zeroes": {
    s: ["Use the first row and column as markers.", "Remember separately whether row 0 or column 0 had a zero.", "Zero cells from the markers, then handle row 0 and column 0 last."],
    w: "Clearing row 0 or column 0 first destroys the markers.",
  },
  "search-a-2d-matrix": {
    s: ["Treat the matrix as one sorted array of m*n.", "Binary search index mid; value is m[mid / n][mid % n].", "Standard comparison."],
  },
  "search-a-2d-matrix-ii": {
    s: ["Start at the top-right corner.", "Bigger than target: move left. Smaller: move down.", "Each step discards a row or a column."],
  },
  "median-of-two-sorted-arrays": {
    s: ["Binary search a cut in the shorter array; the other cut is implied.", "Valid when leftA <= rightB and leftB <= rightA.", "Median comes from the max of the lefts and min of the rights."],
    w: "Use plus and minus infinity for empty sides of a cut.",
  },
  "trapping-rain-water": {
    s: ["Two pointers with leftMax and rightMax.", "Move the side with the smaller max inward.", "Water there = that max - height, since the other side is taller."],
  },
  "container-with-most-water": {
    s: ["Pointers at both ends.", "Area = min height * width; keep the best.", "Move the shorter line inward, since it limits the area."],
  },
  "3sum": {
    s: ["Sort.", "Fix i, then two-pointer on the rest for -nums[i].", "Skip duplicates for i and after each match."],
    w: "Missing the duplicate skips produces repeated triplets.",
  },
  "3sum-closest": {
    k: "Sort, fix one element, and two-pointer the rest while tracking the closest sum.",
    s: ["Sort the array.", "For each i, l = i+1, r = n-1; compute the sum.", "Update closest; move l right if sum is small, r left if large; return early on exact match."],
    T: "O(n^2)", S: "O(1)",
  },
  "4sum": {
    k: "Sort, fix two elements with nested loops, and two-pointer the remaining pair.",
    s: ["Sort.", "Loop i, then j > i, skipping duplicates at both levels.", "Two-pointer for target - nums[i] - nums[j], skipping duplicates after matches."],
    w: "The sum can overflow 32-bit integers; use 64-bit.",
    T: "O(n^3)", S: "O(1)",
  },
  "two-sum-ii": {
    k: "The array is sorted, so two pointers from both ends converge on the pair.",
    s: ["l = 0, r = n-1.", "Sum too small: l++. Too big: r--.", "Return 1-based indices."],
    T: "O(n)", S: "O(1)",
  },
  "remove-element": {
    k: "Write pointer: copy every element that is not val forward.",
    s: ["k = 0.", "For each x != val, nums[k++] = x.", "Return k."],
    T: "O(n)", S: "O(1)",
  },
  "squares-of-a-sorted-array": {
    s: ["Largest squares are at the ends.", "Two pointers; compare absolute values.", "Fill the result from the back."],
  },
  "boats-to-save-people": {
    k: "Sort and pair the heaviest remaining person with the lightest if they fit.",
    s: ["Sort weights.", "l at lightest, r at heaviest; each boat takes r.", "If people[l] + people[r] <= limit, l also boards."],
    T: "O(n log n)", S: "O(1)",
  },
  "maximum-points-you-can-obtain-from-cards": {
    s: ["Taking k from the ends leaves a window of n-k in the middle.", "Find the minimum sum window of size n-k.", "Answer = total - that minimum."],
  },
  "subarray-sums-divisible-by-k": {
    k: "Two prefix sums with the same remainder mod k bound a divisible subarray.",
    s: ["count[0] = 1.", "For each prefix, r = ((sum % k) + k) % k.", "Add count[r] to the answer, then increment count[r]."],
    w: "Negative numbers give negative remainders; normalise them.",
    T: "O(n)", S: "O(k)",
  },
  "insert-delete-getrandom-o1": {
    s: ["Array of values plus a map value -> index.", "Delete: swap with the last element, update its index, pop.", "getRandom picks a random array index."],
    w: "Update the moved element's index in the map before popping.",
  },
  "minimum-swaps-to-sort": {
    s: ["Pair each value with its original index and sort.", "Follow cycles of where each element must go.", "Each cycle of length L costs L - 1 swaps."],
  },
  "merge-two-sorted-arrays-without-extra-space": {
    s: ["Gap method: start with gap = ceil((n+m)/2).", "Compare elements gap apart across both arrays and swap if out of order.", "Halve the gap (rounding up) until it reaches 1, then finish."],
  },
  "count-inversions": {
    s: ["Merge sort the array.", "When taking from the right half, every remaining left element forms an inversion.", "Add (mid - i + 1) each time."],
    w: "The count can exceed 32 bits on large input.",
  },
  "median-of-a-row-wise-sorted-matrix": {
    k: "Binary search on the value: count elements <= mid using upper_bound on every row.",
    s: ["low = smallest first element, high = largest last element.", "Count how many values are <= mid across rows.", "If count <= (r*c)/2, go right; else go left."],
    T: "O(r log c log range)", S: "O(1)",
  },
  "max-value-of-equation": {
    k: "Rewrite as (y_j + x_j) + (y_i - x_i) and keep a monotonic deque of the best y_i - x_i within distance k.",
    s: ["Pop from the front while x_j - x_front > k.", "If non-empty, update answer with y_j + x_j + front value.", "Pop from the back while its value <= y_j - x_j, then push j."],
    T: "O(n)", S: "O(n)",
  },
  "longest-consecutive-sequence": {
    s: ["Put everything in a set.", "Only start counting from x where x-1 is absent.", "Walk x+1, x+2, ... and record the length."],
    w: "Starting from every number makes it quadratic.",
  },
  "contains-duplicate": {
    s: ["Insert into a hash set.", "If already present, return true.", "End of loop means all unique."],
  },
  "two-sum": {
    s: ["Map value -> index as you go.", "For each x, check whether target - x is already in the map.", "Insert x after the check."],
    w: "Inserting before checking can pair an element with itself.",
  },
  "valid-anagram": {
    s: ["Lengths must match.", "Count letters of s up and t down in one array of 26.", "All zero means anagram."],
  },
  "group-anagrams": {
    s: ["Key each word by its sorted letters, or its 26-count signature.", "Group words in a map by that key.", "Return the map's values."],
  },
  "subarray-sum-equals-k": {
    s: ["count[0] = 1.", "For each prefix sum p, add count[p - k] to the answer.", "Then increment count[p]."],
    w: "Sliding window fails because numbers can be negative.",
  },
  "longest-substring-without-repeating-characters": {
    s: ["Map each char to its last index.", "If a char was seen inside the window, move left to lastIndex + 1.", "Record right - left + 1."],
    w: "Take left = max(left, last + 1) so the window never moves backwards.",
  },
  "valid-sudoku": {
    s: ["One set per row, column and 3x3 box.", "Box index = (r / 3) * 3 + c / 3.", "Any repeat in any set fails."],
  },
  "encode-and-decode-strings": {
    s: ["Encode each string as length + '#' + string.", "Decode: read digits up to '#', then take that many characters.", "Works for any content, including '#'."],
  },
  "isomorphic-strings": {
    s: ["Keep two maps, s -> t and t -> s.", "On each pair, any conflicting existing mapping fails.", "Both directions are needed."],
    w: "A single map lets two letters map to the same target.",
  },
  "word-pattern": {
    k: "Bijection between pattern letters and words, checked with two maps.",
    s: ["Split the string; lengths must match.", "Map letter -> word and word -> letter.", "Any conflict fails."],
    T: "O(n)", S: "O(n)",
  },
  "intersection-of-two-arrays-ii": {
    k: "Count one array, then consume counts while scanning the other.",
    s: ["Count the smaller array in a map.", "For each x in the other, if count[x] > 0, output x and decrement.", "Sorted inputs: two pointers instead."],
    T: "O(n + m)", S: "O(min(n, m))",
  },
  "happy-number": {
    s: ["Next number = sum of squared digits.", "Detect a cycle with fast and slow pointers, or a set.", "Happy if you reach 1."],
  },
  "first-unique-character-in-a-string": {
    k: "Count characters, then return the first index whose count is 1.",
    s: ["Count all 26 letters.", "Scan again in order.", "Return -1 if none."],
    T: "O(n)", S: "O(1)",
  },
  "find-all-anagrams-in-a-string": {
    s: ["Fixed window of length p.", "Keep letter counts of the window and of p.", "Slide one step at a time and compare counts (or a matches counter)."],
  },
  "longest-palindrome": {
    k: "Use every pair of each letter, plus one odd letter in the middle if any exists.",
    s: ["Count letters.", "Add count / 2 * 2 for each.", "Add 1 if any count was odd."],
    T: "O(n)", S: "O(1)",
  },
  "ransom-note": {
    k: "Count the magazine letters and consume them for the note.",
    s: ["Count magazine letters.", "For each note letter, decrement; below zero fails."],
    T: "O(n + m)", S: "O(1)",
  },
  "top-k-frequent-words": {
    k: "Count words, then keep the k best by frequency with ties broken alphabetically.",
    s: ["Count with a map.", "Min-heap of size k ordered by (freq asc, word desc).", "Pop all and reverse."],
    w: "The tie-break flips inside a min-heap: the alphabetically larger word must be popped first.",
    T: "O(n log k)", S: "O(n)",
  },
  "4sum-ii": {
    s: ["Count every sum a + b from the first two arrays.", "For every c + d, add count[-(c + d)].", "O(n^2) instead of O(n^4)."],
  },
  "continuous-subarray-sum": {
    k: "Same prefix remainder mod k at two indices at least two apart means a valid subarray.",
    s: ["Map remainder -> earliest index, with remainder 0 at index -1.", "For each prefix, if its remainder was seen at least 2 indices back, return true.", "Only store the first occurrence."],
    w: "Overwriting the stored index loses the length-two guarantee.",
    T: "O(n)", S: "O(min(n, k))",
  },
  "max-points-on-a-line": {
    s: ["Fix each point as an anchor.", "Count other points by reduced slope (dy/g, dx/g with a sign rule).", "Best count + 1 per anchor."],
    w: "Floating point slopes collide; use a reduced integer pair.",
  },
  "longest-harmonious-subsequence": {
    k: "Count values; the answer is the best count[x] + count[x+1] where both exist.",
    s: ["Count with a map.", "For each x with x+1 present, try count[x] + count[x+1]."],
    T: "O(n)", S: "O(n)",
  },
  "range-sum-query-immutable": {
    k: "Precompute prefix sums so each query is a subtraction.",
    s: ["pre[i+1] = pre[i] + nums[i].", "sumRange(l, r) = pre[r+1] - pre[l]."],
    T: "O(1) per query", S: "O(n)",
  },
  "range-sum-query-2d-immutable": {
    s: ["Build pre[i+1][j+1] = cell + top + left - topLeft.", "Query with inclusion-exclusion over four corners.", "Pad by one row and column to avoid edge checks."],
  },
  "find-pivot-index": {
    k: "Left sum equals total - left sum - nums[i].",
    s: ["Compute the total.", "Walk with a running left sum and check the equation.", "Return the first match or -1."],
    T: "O(n)", S: "O(1)",
  },
  "contiguous-array": {
    s: ["Treat 0 as -1.", "Equal prefix sums mean a balanced subarray between them.", "Map prefix -> earliest index; longest gap wins."],
  },
  "subarray-with-xor-k": {
    s: ["Running prefix XOR x.", "Add count[x ^ k] to the answer.", "Increment count[x]; start with count[0] = 1."],
  },
  "longest-subarray-with-sum-k": {
    k: "Prefix sums with a map from sum to its earliest index; with only positives, a sliding window also works.",
    s: ["Map prefix sum -> first index, with 0 at -1.", "If sum - k was seen, length = i - firstIndex.", "Store a sum only the first time."],
    w: "Overwriting the first index shortens the answer.",
    T: "O(n)", S: "O(n)",
  },
  "product-of-the-last-k-numbers": {
    k: "Keep prefix products and reset them whenever a zero arrives.",
    s: ["List starts as [1].", "add(0) resets to [1]; otherwise append last * num.", "getProduct(k): if k >= length, return 0; else last / list[len-1-k]."],
    T: "O(1) per call", S: "O(n)",
  },
  "car-pooling": {
    s: ["Difference array over locations: +p at from, -p at to.", "Prefix sum gives the passengers on board at each point.", "Fail if it ever exceeds capacity."],
  },
  "corporate-flight-bookings": {
    k: "Difference array: add seats at first, subtract after last, then prefix sum.",
    s: ["diff[first-1] += seats, diff[last] -= seats.", "Prefix sum diff into the answer."],
    T: "O(n + bookings)", S: "O(n)",
  },
  "number-of-submatrices-that-sum-to-target": {
    k: "Fix a pair of rows, collapse columns into a 1D array, and count subarrays summing to target.",
    s: ["Row prefix sums per column.", "For each top row and bottom row, column sums form an array.", "Run subarray-sum-equals-k with a hash map on it."],
    T: "O(r^2 * c)", S: "O(c)",
  },
  "maximum-size-subarray-sum-equals-k": {
    k: "Prefix sum -> earliest index; the longest i - first[sum - k] wins.",
    s: ["first[0] = -1.", "At each i, if sum - k is in the map, update the length.", "Insert sum only if new."],
    T: "O(n)", S: "O(n)",
  },
  "merge-sort-implementation": {
    s: ["Split at mid and sort both halves recursively.", "Merge with two pointers into a buffer.", "Copy the buffer back."],
    w: "Use <= when merging to keep the sort stable.",
  },
  "quick-sort-implementation": {
    s: ["Pick a pivot (random is safest).", "Partition: smaller left, larger right (Lomuto or Hoare).", "Recurse on both sides."],
    w: "Recurse on the smaller side first to keep stack depth at O(log n).",
  },
  "largest-number": {
    s: ["Convert to strings.", "Sort with comparator: a before b if a+b > b+a.", "Join; if the first is '0', return '0'."],
  },
  "sort-characters-by-frequency": {
    k: "Count characters, then emit them grouped by descending frequency.",
    s: ["Count with a map.", "Bucket by frequency, or sort the entries.", "Repeat each character count times."],
    T: "O(n)", S: "O(n)",
  },
  "meeting-rooms": {
    s: ["Sort by start.", "Any start before the previous end is a clash.", "Otherwise one person can attend all."],
  },
  "h-index": {
    k: "h is the largest value such that at least h papers have h or more citations.",
    s: ["Bucket counts with everything above n clamped to n.", "Walk from n down, summing papers.", "The first h where the sum >= h is the answer."],
    T: "O(n)", S: "O(n)",
  },
  "relative-sort-array": {
    k: "Counting sort that emits arr2's order first, then the rest ascending.",
    s: ["Count arr1 values.", "For each x in arr2, emit it count[x] times.", "Emit the remaining values in increasing order."],
    T: "O(n + range)", S: "O(range)",
  },
  "custom-sort-string": {
    k: "Count s, then emit characters in order's sequence, then the leftovers.",
    s: ["Count characters of s.", "For each char in order, emit it count times and clear it.", "Append everything else."],
    T: "O(n)", S: "O(1)",
  },
  "sort-array-by-parity": {
    k: "Two pointers: swap an odd on the left with an even on the right.",
    s: ["l from start, r from end.", "Advance l past evens, r past odds.", "Swap and continue."],
    T: "O(n)", S: "O(1)",
  },
  "kth-smallest-element": {
    k: "Max-heap of size k, or quickselect.",
    s: ["Push values into a max-heap; pop when size exceeds k.", "The top is the kth smallest.", "Quickselect gives average O(n)."],
    T: "O(n log k)", S: "O(k)",
  },
  "count-sort-implementation": {
    s: ["Count occurrences of each value in the range.", "Prefix-sum counts to get final positions.", "Place from the right for stability."],
  },
};
