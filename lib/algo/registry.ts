import type { TopicId, VizAlgo } from "@/lib/types";
import { SORTING_ALGOS } from "./sorting";
import { ARRAY_ALGOS } from "./arrays";
import { GRAPH_ALGOS } from "./graphs";
import { TREE_ALGOS } from "./trees";
import { DP_ALGOS } from "./dp";
import { LIST_ALGOS } from "./lists";
import { BACKTRACK_ALGOS } from "./backtracking";
import { STRING_ALGOS } from "./strings";

export const ALGOS: VizAlgo[] = [
  ...ARRAY_ALGOS,
  ...SORTING_ALGOS,
  ...LIST_ALGOS,
  ...TREE_ALGOS,
  ...GRAPH_ALGOS,
  ...DP_ALGOS,
  ...BACKTRACK_ALGOS,
  ...STRING_ALGOS,
];

export const ALGO_MAP: Record<string, VizAlgo> = Object.fromEntries(ALGOS.map((a) => [a.slug, a]));

export const algosForTopic = (topic: TopicId) => ALGOS.filter((a) => a.topic === topic);

export const algoForProblem = (problemId: string) => ALGOS.filter((a) => a.related?.includes(problemId));

export const ALGO_COUNT = ALGOS.length;

/** Safe runner: a bad input string should never crash the page. */
export function runAlgo(algo: VizAlgo, input: string) {
  try {
    const frames = algo.run(input);
    if (!frames.length) throw new Error("no frames");
    return { frames, error: null as string | null };
  } catch {
    try {
      return { frames: algo.run(algo.defaultInput), error: "That input did not parse, so the default was used." };
    } catch {
      return { frames: [{ note: "This visualiser could not run.", state: {} }], error: "Visualiser failed." };
    }
  }
}
