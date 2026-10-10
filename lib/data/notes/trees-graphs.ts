import type { NoteBook } from "./_types";

/** Refresher notes for lib/data/problems/trees-graphs.ts. */
export const TREES_GRAPHS_NOTES: NoteBook = {
  "maximum-depth-of-binary-tree": {
    s: ["Empty tree has depth 0.", "Depth = 1 + max(depth(left), depth(right)).", "Or count BFS levels."],
  },
  "same-tree": {
    k: "Recursively compare values and both subtrees.",
    s: ["Both null: true. One null: false.", "Values differ: false.", "Recurse on left with left and right with right."],
    T: "O(n)", S: "O(h)",
  },
  "invert-binary-tree": {
    s: ["Swap the left and right children.", "Recurse into both.", "Return the root."],
  },
  "binary-tree-maximum-path-sum": {
    s: ["gain(node) = node + max(0, gain(left), gain(right)), the best downward path.", "At each node, update the answer with node + max(0, left) + max(0, right).", "Return only the single-branch gain to the parent."],
    w: "Initialise the answer to minus infinity, not 0, for all-negative trees.",
  },
  "binary-tree-level-order-traversal": {
    s: ["BFS with a queue.", "Process exactly the current queue size per level.", "Push children for the next level."],
  },
  "serialize-and-deserialize-binary-tree": {
    s: ["Preorder with a marker for null.", "Deserialize by consuming tokens in the same order.", "Recursion rebuilds the shape from the null markers."],
  },
  "subtree-of-another-tree": {
    k: "At every node of the big tree, check whether the trees are identical there.",
    s: ["Write isSame(a, b).", "isSubtree(root) = isSame(root, sub) or isSubtree(left) or isSubtree(right).", "Serialising both and string-matching gives O(n + m)."],
    T: "O(n * m)", S: "O(h)",
  },
  "construct-binary-tree-from-preorder-and-inorder-traversal": {
    s: ["The next preorder value is the root.", "Its inorder index splits the left and right subtrees.", "Map value -> inorder index for O(1) lookups."],
  },
  "balanced-binary-tree": {
    s: ["Return height, or -1 if a subtree is unbalanced.", "Unbalanced if the heights differ by more than 1.", "Propagate -1 upward immediately."],
  },
  "diameter-of-binary-tree": {
    s: ["Compute heights bottom-up.", "At each node, the path through it is left + right.", "Track the max; return 1 + max(left, right)."],
  },
  "binary-tree-right-side-view": {
    s: ["BFS level by level.", "Record the last node of each level.", "Or DFS right-first, recording the first node at each new depth."],
  },
  "count-good-nodes-in-binary-tree": {
    k: "DFS carrying the max value on the path from the root.",
    s: ["Node is good if its value >= pathMax.", "Recurse with max(pathMax, node.val).", "Sum the counts."],
    T: "O(n)", S: "O(h)",
  },
  "lowest-common-ancestor-of-a-binary-tree": {
    s: ["If the node is null, p or q, return it.", "Recurse left and right.", "Both non-null: this node is the LCA; else return the non-null side."],
  },
  "binary-tree-zigzag-level-order-traversal": {
    k: "Level order BFS, reversing every other level.",
    s: ["BFS by level.", "Toggle a leftToRight flag each level.", "Reverse (or fill from the back) when it is false."],
    T: "O(n)", S: "O(n)",
  },
  "path-sum-ii": {
    k: "DFS with a path list and remaining sum; record copies at matching leaves.",
    s: ["Append node, subtract its value.", "At a leaf with remaining 0, copy the path into the result.", "Recurse, then pop on the way back."],
    w: "Push a copy of the path, not the shared list.",
    T: "O(n^2) worst", S: "O(h)",
  },
  "path-sum-iii": {
    s: ["Prefix sums along the root-to-node path.", "count[current - target] gives paths ending here.", "Increment before recursing, decrement after (backtrack)."],
  },
  "flatten-binary-tree-to-linked-list": {
    s: ["For each node with a left child, find the rightmost node of the left subtree.", "Attach the right subtree there.", "Move left to right, null the left, step right."],
  },
  "binary-tree-inorder-traversal": {
    s: ["Push all left nodes onto a stack.", "Pop, visit, then move to the right child.", "Repeat while the stack or current is non-empty."],
  },
  "binary-tree-preorder-traversal": {
    k: "Stack: visit the node, push right then left.",
    s: ["Push root.", "Pop, visit, push right child, then left child.", "Left comes off first."],
    T: "O(n)", S: "O(h)",
  },
  "binary-tree-postorder-traversal": {
    k: "Do a modified preorder (node, right, left) and reverse it.",
    s: ["Stack: pop, add to output, push left then right.", "Reverse the output.", "Or use one stack with a last-visited pointer."],
    T: "O(n)", S: "O(h)",
  },
  "morris-inorder-traversal": {
    s: ["If there is no left child, visit and go right.", "Else find the inorder predecessor; if its right is null, thread it to cur and go left.", "If the thread exists, remove it, visit, and go right."],
  },
  "vertical-order-traversal": {
    s: ["Traverse with (column, row) for every node.", "Sort by column, then row, then value.", "Group by column."],
  },
  "top-view-of-binary-tree": {
    k: "BFS with horizontal distance; the first node seen in each column is in the top view.",
    s: ["Queue of (node, hd).", "If hd is new, record node.", "Children get hd - 1 and hd + 1; output columns left to right."],
    w: "DFS needs the depth too, or a deeper node can overwrite a shallower one.",
    T: "O(n log n) with a map", S: "O(n)",
  },
  "bottom-view-of-binary-tree": {
    k: "BFS with horizontal distance, overwriting so the last node in each column wins.",
    s: ["Queue of (node, hd).", "Always set map[hd] = node.", "Output columns left to right."],
    T: "O(n log n) with a map", S: "O(n)",
  },
  "boundary-traversal-of-binary-tree": {
    k: "Root, then the left boundary without leaves, then all leaves, then the right boundary reversed.",
    s: ["Left boundary: walk left (right if no left), skipping leaves.", "Leaves: DFS left to right.", "Right boundary: walk right, skip leaves, add in reverse."],
    w: "Do not count the root as a leaf when it is the only node.",
    T: "O(n)", S: "O(h)",
  },
  "maximum-width-of-binary-tree": {
    s: ["BFS with positional indices: children at 2i and 2i + 1.", "Width = last index - first index + 1 per level.", "Subtract the level's first index to stop overflow."],
  },
  "all-nodes-distance-k-in-binary-tree": {
    s: ["Record parent pointers.", "BFS from the target over left, right and parent.", "Collect the nodes at distance k."],
  },
  "burning-tree": {
    k: "Add parent pointers, then BFS outward from the target; the number of levels is the time.",
    s: ["DFS to map each node to its parent and find the target.", "BFS through left, right and parent with a visited set.", "Count levels until the queue empties."],
    T: "O(n)", S: "O(n)",
  },
  "symmetric-tree": {
    k: "Compare the left subtree with the mirror of the right subtree.",
    s: ["mirror(a, b): both null true; one null false.", "Values equal and mirror(a.left, b.right) and mirror(a.right, b.left).", "Call mirror(root.left, root.right)."],
    T: "O(n)", S: "O(h)",
  },
  "populating-next-right-pointers": {
    k: "Use the next pointers already set on the level above to link the level below.",
    s: ["For each level start, walk across using next.", "node.left.next = node.right.", "node.right.next = node.next.left if node.next exists."],
    T: "O(n)", S: "O(1)",
  },
  "binary-tree-cameras": {
    k: "Greedy postorder with three states: covered, has camera, needs cover.",
    s: ["Null children count as covered.", "If any child needs cover, place a camera here.", "If a child has a camera, this node is covered; else it needs cover. Fix the root at the end."],
    T: "O(n)", S: "O(h)",
  },
  "house-robber-iii": {
    s: ["Return a pair (rob this node, skip this node).", "rob = val + left.skip + right.skip.", "skip = max(left pair) + max(right pair)."],
  },
  "construct-tree-from-inorder-and-postorder": {
    k: "The last postorder value is the root; build the right subtree before the left.",
    s: ["Map value -> inorder index.", "Pop roots from the end of postorder.", "Recurse right first, then left, on the inorder split."],
    T: "O(n)", S: "O(n)",
  },
  "children-sum-property": {
    k: "Push values down before recursing so children are large enough, then fix the parent from the children on the way up.",
    s: ["If children sum < node, set the children to node's value.", "Recurse into both.", "Set node = sum of children (if any) after returning."],
    T: "O(n)", S: "O(h)",
  },
  "diameter-of-n-ary-tree": {
    k: "At each node combine the two tallest child heights.",
    s: ["DFS returns height.", "Track the top two child heights.", "Answer = max(answer, top1 + top2); return top1 + 1."],
    T: "O(n)", S: "O(h)",
  },
  "validate-binary-search-tree": {
    s: ["Recurse with a (low, high) range.", "Every node must lie strictly inside its range.", "Left narrows high to node; right narrows low to node."],
    w: "Checking only the immediate children misses deeper violations.",
  },
  "kth-smallest-element-in-a-bst": {
    s: ["Iterative inorder traversal.", "Count each visited node.", "Stop at the kth."],
  },
  "lowest-common-ancestor-of-a-binary-search-tree": {
    s: ["If both values are smaller, go left.", "If both are larger, go right.", "Otherwise this node splits them and is the LCA."],
  },
  "search-in-a-binary-search-tree": {
    k: "Go left or right by comparing with the node, like binary search.",
    s: ["While node and node.val != val: go left if smaller, else right.", "Return node."],
    T: "O(h)", S: "O(1)",
  },
  "insert-into-a-binary-search-tree": {
    k: "Walk down by comparison and attach the new node at the first empty spot.",
    s: ["If root is null, return a new node.", "Recurse into the side the value belongs to.", "Assign the returned subtree back."],
    T: "O(h)", S: "O(h)",
  },
  "delete-node-in-a-bst": {
    s: ["Find the node.", "Zero or one child: return the other child.", "Two children: copy the inorder successor's value and delete it from the right subtree."],
  },
  "convert-sorted-array-to-bst": {
    k: "The middle element is the root; recurse on each half.",
    s: ["build(l, r): if l > r return null.", "mid = (l + r) / 2 is the root.", "root.left = build(l, mid - 1), root.right = build(mid + 1, r)."],
    T: "O(n)", S: "O(log n)",
  },
  "inorder-successor-in-bst": {
    k: "Walk from the root: whenever p is smaller than the node, the node is a candidate and you go left.",
    s: ["succ = null.", "If p.val < node.val: succ = node, go left.", "Else go right. Return succ."],
    T: "O(h)", S: "O(1)",
  },
  "two-sum-iv-input-is-a-bst": {
    k: "DFS with a hash set of values seen so far.",
    s: ["For each node, check whether k - val is in the set.", "Add val.", "Recurse both sides."],
    T: "O(n)", S: "O(n)",
  },
  "recover-binary-search-tree": {
    s: ["Inorder traversal tracking the previous node.", "First drop: first = prev; every drop: second = current.", "Swap the values of first and second."],
  },
  "largest-bst-in-a-binary-tree": {
    k: "Postorder returning (isBST, size, min, max) for each subtree.",
    s: ["Leaves of null are BSTs with min = +inf, max = -inf.", "Node is a BST if both children are and left.max < val < right.min.", "Track the largest size; if not a BST, pass up an invalid range."],
    T: "O(n)", S: "O(h)",
  },
  "bst-iterator": {
    s: ["Stack of the left path from the root.", "next pops a node and pushes the left path of its right child.", "hasNext checks the stack is non-empty."],
  },
  "floor-and-ceil-in-bst": {
    k: "Walk down once, recording the best candidate on the correct side.",
    s: ["Floor: if node.val <= x, record it and go right; else go left.", "Ceil: if node.val >= x, record it and go left; else go right.", "Equal values return immediately."],
    T: "O(h)", S: "O(1)",
  },
  "predecessor-successor-in-bst": {
    k: "Walk from the root, updating the predecessor when going right and the successor when going left.",
    s: ["If key < node: successor = node, go left.", "If key > node: predecessor = node, go right.", "If equal: predecessor is the max of the left subtree, successor the min of the right."],
    T: "O(h)", S: "O(1)",
  },
  "kth-largest-in-bst": {
    k: "Reverse inorder (right, node, left) and stop at the kth node.",
    s: ["Traverse right subtree first.", "Count each visited node.", "Return when the count reaches k."],
    T: "O(h + k)", S: "O(h)",
  },
  "clone-graph": {
    s: ["Hash map original -> clone.", "DFS or BFS; create the clone on first sight.", "Connect the clone's neighbours through the map."],
  },
  "course-schedule": {
    s: ["Build the graph and in-degrees.", "Kahn: queue every node with in-degree 0 and remove its edges.", "Possible if every node is processed."],
  },
  "course-schedule-ii": {
    k: "Kahn's topological sort; the processing order is the course order.",
    s: ["Build adjacency lists and in-degrees.", "Queue in-degree 0 nodes; pop, append, decrement neighbours.", "If fewer than n are output, return []."],
    T: "O(V + E)", S: "O(V + E)",
  },
  "pacific-atlantic-water-flow": {
    s: ["Search backwards from each ocean's border cells.", "Move uphill only (to cells at least as tall).", "Cells reached from both oceans are the answer."],
  },
  "alien-dictionary": {
    s: ["Compare adjacent words; the first differing letter gives an edge.", "Topologically sort the letters.", "Invalid if a word is followed by its own prefix, or a cycle exists."],
  },
  "graph-valid-tree": {
    s: ["A tree has exactly n - 1 edges.", "Union-find: any edge joining an already connected pair is a cycle.", "With n - 1 edges and no cycle, it is connected."],
  },
  "number-of-connected-components": {
    k: "Union-find, or count DFS starts over unvisited nodes.",
    s: ["components = n.", "For each edge, if union merges two sets, components--.", "Return components."],
    T: "O(E α(n))", S: "O(n)",
  },
  "rotting-oranges": {
    s: ["Multi-source BFS starting from every rotten orange.", "Each BFS level is one minute.", "Return -1 if any fresh orange remains."],
  },
  "walls-and-gates": {
    k: "Multi-source BFS from every gate fills distances in one pass.",
    s: ["Queue all gates.", "BFS to empty rooms still at INF, setting dist + 1.", "Walls are skipped."],
    T: "O(m * n)", S: "O(m * n)",
  },
  "surrounded-regions": {
    s: ["From every border 'O', flood and mark it safe.", "Flip all remaining 'O' to 'X'.", "Turn safe cells back into 'O'."],
  },
  "word-ladder": {
    s: ["BFS from beginWord; each level is one more word.", "Neighbours: change one letter, keep only dictionary words.", "Remove words when visited."],
  },
  "redundant-connection": {
    s: ["Union-find over the edges in order.", "The first edge whose endpoints are already connected is redundant.", "Return it."],
  },
  "accounts-merge": {
    k: "Union-find over emails, then group emails by their root.",
    s: ["Union every email in an account with the first email.", "Remember an email -> name.", "Group by root, sort each group, prepend the name."],
    T: "O(N log N)", S: "O(N)",
  },
  "number-of-provinces": {
    k: "Count connected components in the adjacency matrix.",
    s: ["DFS from each unvisited city.", "Mark everything reachable.", "Each start is one province."],
    T: "O(n^2)", S: "O(n)",
  },
  "network-delay-time": {
    s: ["Dijkstra from k.", "Settle the closest node each time with a min-heap.", "Answer = max distance, or -1 if any node is unreachable."],
  },
  "cheapest-flights-within-k-stops": {
    s: ["Bellman-Ford limited to k + 1 rounds.", "Relax from a copy of the previous round's distances.", "Or BFS by stops while pruning by cost."],
    w: "Relaxing in place lets a path use more stops than allowed.",
  },
  "path-with-minimum-effort": {
    k: "Dijkstra where a path's cost is its largest single step.",
    s: ["dist[start] = 0 in a min-heap.", "Moving to a neighbour costs max(current effort, |height difference|).", "Return when the bottom-right cell is popped."],
    T: "O(mn log mn)", S: "O(mn)",
  },
  "swim-in-rising-water": {
    k: "Dijkstra (or a min-heap BFS) where a path's cost is the maximum elevation on it.",
    s: ["Heap of (max elevation so far, cell).", "Pop the smallest; push neighbours with max(cost, their height).", "The cost when the target is popped is the answer."],
    T: "O(n^2 log n)", S: "O(n^2)",
  },
  "min-cost-to-connect-all-points": {
    s: ["Prim's algorithm on the implicit complete graph.", "Keep a min distance from the tree to every point.", "Add the closest point and update distances; O(n^2)."],
  },
  "reconstruct-itinerary": {
    s: ["Sort each airport's destinations.", "Hierholzer DFS: always take the smallest unused ticket.", "Prepend each airport once it is fully explored."],
  },
  "longest-increasing-path-in-a-matrix": {
    s: ["DFS from every cell, moving only to larger neighbours.", "Memoise the longest path from each cell.", "No visited set is needed, since strictly increasing paths cannot cycle."],
  },
  "01-matrix": {
    k: "Multi-source BFS starting from every 0.",
    s: ["Queue all zeros with distance 0; mark the rest unknown.", "BFS outward setting distance + 1.", "Each cell is set once."],
    T: "O(m * n)", S: "O(m * n)",
  },
  "shortest-path-in-binary-matrix": {
    k: "BFS over 8 directions from the top-left corner.",
    s: ["If the start or end is blocked, return -1.", "BFS with path length, marking visited cells.", "Return the length on reaching the bottom-right."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "word-search-ii": {
    s: ["Build a trie of the words.", "DFS from every cell, following trie edges.", "Record the word at a terminal node and prune finished branches."],
  },
  "detect-cycle-in-directed-graph": {
    k: "DFS with three colours: a back edge to a node on the current path is a cycle.",
    s: ["States: unvisited, on path, done.", "DFS; reaching an on-path node means a cycle.", "Mark done when leaving. (Kahn: fewer than V processed also means a cycle.)"],
    T: "O(V + E)", S: "O(V)",
  },
  "detect-cycle-in-undirected-graph": {
    k: "DFS or BFS: reaching a visited node that is not your parent means a cycle.",
    s: ["Track the parent of each node.", "A visited neighbour other than the parent is a cycle.", "Run from every unvisited node, or use union-find."],
    T: "O(V + E)", S: "O(V)",
  },
  "is-graph-bipartite": {
    s: ["Two-colour with BFS from every uncoloured node.", "Neighbours get the opposite colour.", "Same colour on both ends of an edge fails."],
  },
  "bellman-ford": {
    s: ["Relax every edge V - 1 times.", "One more pass: any relaxation means a negative cycle.", "Works with negative weights; O(VE)."],
  },
  "floyd-warshall": {
    s: ["dist[i][j] starts at the edge weight (or infinity).", "For each k, try i -> k -> j.", "The loop order k, i, j matters."],
    w: "A negative dist[i][i] at the end means a negative cycle.",
  },
  "kosaraju-scc": {
    k: "DFS to order by finish time, then DFS the reversed graph in that order; each tree is a component.",
    s: ["First pass: push nodes onto a stack when they finish.", "Reverse every edge.", "Pop from the stack; each new DFS on the reversed graph is one component."],
    T: "O(V + E)", S: "O(V + E)",
  },
  "bridges-in-graph": {
    s: ["DFS with discovery time tin and low-link low.", "low[u] = min(tin[u], low of children, tin of back-edge targets).", "Edge (u, v) is a bridge if low[v] > tin[u]."],
  },
  "articulation-points": {
    k: "Tarjan low-link: u is a cut vertex if some child v has low[v] >= tin[u].",
    s: ["DFS with tin and low.", "Non-root u: cut vertex if a child has low[child] >= tin[u].", "Root: cut vertex if it has more than one DFS child."],
    T: "O(V + E)", S: "O(V)",
  },
  "eventual-safe-states": {
    k: "Nodes that cannot reach a cycle; topological sort on the reversed graph finds them.",
    s: ["Reverse the edges and count out-degrees.", "Queue terminal nodes (out-degree 0).", "Peel them off; every node that gets processed is safe. Sort the result."],
    T: "O(V + E)", S: "O(V + E)",
  },
  "number-of-enclaves": {
    k: "Flood from the border land cells, then count land that was never reached.",
    s: ["DFS or BFS from every border 1, marking it.", "Count the remaining 1s."],
    T: "O(m * n)", S: "O(m * n)",
  },
  "word-ladder-ii": {
    k: "BFS level by level to build a parent graph of shortest edges, then backtrack all paths from the end.",
    s: ["BFS, removing each level's words from the dictionary only after the level finishes.", "Record parents for every word reached at this level.", "DFS from endWord back to beginWord through the parents."],
    w: "Removing words as soon as they are seen loses alternative shortest paths.",
    T: "O(N * L * 26) plus output", S: "O(N * L)",
  },
  "making-a-large-island": {
    k: "Label each island with its size, then try flipping each 0 and sum the distinct neighbouring islands.",
    s: ["DFS each island, writing an id and recording its area.", "For each 0, add 1 + areas of distinct neighbour ids.", "If there is no 0, the answer is the whole grid."],
    T: "O(n^2)", S: "O(n^2)",
  },
  "operations-to-make-network-connected": {
    k: "Need components - 1 cables, possible only when edges >= n - 1.",
    s: ["If edges < n - 1, return -1.", "Count components with union-find or DFS.", "Return components - 1."],
    T: "O(n + E)", S: "O(n)",
  },
  "snakes-and-ladders": {
    k: "BFS over squares 1..n^2, converting a square number to the boustrophedon board position.",
    s: ["From each square try the next 1..6.", "Follow a snake or ladder if present.", "Return the move count on reaching n^2."],
    w: "Rows alternate direction from the bottom; get the conversion right.",
    T: "O(n^2)", S: "O(n^2)",
  },
  "minimum-genetic-mutation": {
    k: "BFS over valid genes, changing one character at a time.",
    s: ["Bank as a set.", "From each gene try all 8 * 4 single changes.", "Return the level when the end gene is reached, else -1."],
    T: "O(B * L * 4)", S: "O(B)",
  },
  "evaluate-division": {
    s: ["Build a weighted graph: a -> b with value, b -> a with 1/value.", "For each query, DFS multiplying weights along the path.", "Unknown variables give -1."],
  },
};
