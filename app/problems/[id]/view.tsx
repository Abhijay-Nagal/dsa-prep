"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge } from "@/components/ui/bits";
import { ApproachPanel, HintLadder, NotesPanel, PlatformLinks, SolveBar } from "@/components/problems/detail";
import { CodePad } from "@/components/problems/CodePad";
import { PageNav } from "@/components/ui/PageNav";
import { InterviewMode } from "@/components/problems/InterviewMode";
import { ProblemRow, StarButton } from "@/components/problems/ProblemList";
import { PROBLEM_MAP, PROBLEMS, byPattern } from "@/lib/data/problems";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { TOPIC_MAP } from "@/lib/data/topics";
import { COMPANY_MAP } from "@/lib/data/companies";
import { SHEETS } from "@/lib/data/sheets";
import { algoForProblem } from "@/lib/algo/registry";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { useNow } from "@/hooks/useNow";
import { retrievability } from "@/lib/engine/srs";
import { getMastery } from "@/lib/engine/recommender";
import { useSnapshot } from "@/hooks/useLearner";

export default function ProblemDetail() {
  const params = useParams<{ id: string }>();
  const problem = PROBLEM_MAP[params.id];
  const hydrated = useHydrated();
  const snap = useSnapshot();
  const prog = useStore((s) => s.progress[params.id]);
  const now = useNow();
  const touchRecent = useStore((s) => s.touchRecent);

  /* Feeds the notebook's Recent tab and the palette's no-query list. */
  useEffect(() => {
    if (PROBLEM_MAP[params.id]) touchRecent(params.id);
  }, [params.id, touchRecent]);

  const siblings = useMemo(() => {
    if (!problem) return [];
    const variants = (problem.variants ?? []).map((id) => PROBLEM_MAP[id]).filter(Boolean);
    const samePattern = problem.patterns
      .flatMap((p) => byPattern(p))
      .filter((p) => p.id !== problem.id && !variants.some((v) => v.id === p.id));
    const seen = new Set<string>();
    return [...variants, ...samePattern].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 8);
  }, [problem]);

  const vizzes = useMemo(() => (problem ? algoForProblem(problem.id) : []), [problem]);

  if (!problem) return notFound();

  const topic = TOPIC_MAP[problem.topic];
  const sheet = SHEETS.find((s) => s.tier === problem.tier);
  const idx = PROBLEMS.findIndex((p) => p.id === problem.id);
  const prev = PROBLEMS[idx - 1];
  const next = PROBLEMS[idx + 1];
  const card = prog?.srs;
  const recall = hydrated && card && now ? retrievability(card, now) : null;

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <PageNav
        fallback="/problems"
        showOrigin
        crumbs={[
          { label: "Problems", href: "/problems" },
          { label: topic?.name ?? problem.topic, href: `/learn/${problem.topic}` },
          { label: problem.title },
        ]}
      />

      {/* header */}
      <div className="panel overflow-hidden">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${topic?.color}, transparent)` }} />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{problem.title}</h1>
                <DiffBadge d={problem.difficulty} />
                {problem.must && (
                  <Chip color="var(--gold)" icon="Star">
                    must do
                  </Chip>
                )}
                <StarButton id={problem.id} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Chip color={topic?.color} icon={topic?.icon}>
                  {topic?.name}
                </Chip>
                {sheet && <Chip color={sheet.color}>{sheet.name}</Chip>}
                <Chip icon="Clock">{problem.est} min target</Chip>
                <Chip icon="TrendingUp">frequency {problem.freq}/5</Chip>
                {problem.links.lc && <Chip>LeetCode {problem.links.lc}</Chip>}
              </div>
            </div>

            {hydrated && prog?.status === "solved" && (
              <div className="panel shrink-0 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-easy">
                  <Icon name="CheckCircle2" size={13} /> Solved
                </div>
                {prog.solvedAt && (
                  <div className="mt-1 text-faint">{new Date(prog.solvedAt).toLocaleDateString()}</div>
                )}
                {recall !== null && (
                  <div className="mt-1 text-faint">
                    recall now {Math.round(recall * 100)}%
                    {card && card.due > now && (
                      <>
                        <br />
                        next review {new Date(card.due).toLocaleDateString()}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {problem.patterns.map((p) => (
              <Link key={p} href={`/learn/pattern/${p}`}>
                <Chip icon="Wand2" color="var(--accent)">
                  {PATTERN_MAP[p]?.name ?? p}
                </Chip>
              </Link>
            ))}
          </div>

          {problem.companies.length > 0 && (
            <div className="mt-3 border-t border-line-soft pt-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Asked at</div>
              <div className="flex flex-wrap gap-1.5">
                {problem.companies.map((c) => (
                  <Link key={c} href={`/companies/${c}`}>
                    <Chip color={COMPANY_MAP[c]?.color}>{COMPANY_MAP[c]?.name ?? c}</Chip>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <InterviewMode problem={problem} />
          <HintLadder problem={problem} />
          <ApproachPanel problem={problem} />
          <CodePad problemId={problem.id} title={problem.title} />
          <NotesPanel problemId={problem.id} />
        </div>

        <div className="space-y-4">
          <PlatformLinks problem={problem} />

          {vizzes.length > 0 && (
            <div className="panel p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Icon name="PlayCircle" size={14} className="text-accent-2" /> Watch the mechanism
              </div>
              <div className="space-y-1.5">
                {vizzes.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/visualize/${a.slug}`}
                    className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-2 text-xs transition-colors hover:border-accent/60"
                  >
                    <Icon name="Play" size={12} className="text-accent" />
                    <span className="min-w-0 flex-1 truncate">{a.name}</span>
                    <Icon name="ArrowRight" size={12} className="text-faint" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="panel p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Icon name="Activity" size={14} className="text-accent-3" /> Your model
            </div>
            <div className="space-y-2">
              {[...problem.patterns, problem.topic].map((key) => {
                const m = getMastery(snap, key);
                const name = PATTERN_MAP[key]?.name ?? TOPIC_MAP[key]?.name ?? key;
                return (
                  <div key={key}>
                    <div className="mb-0.5 flex items-center justify-between text-[11px]">
                      <span className="truncate text-dim">{name}</span>
                      <span className="font-mono text-faint">{Math.round(m.p * 100)}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-panel-2">
                      <div className="h-full rounded-full" style={{ width: `${m.p * 100}%`, background: "var(--accent)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2.5 text-[10.5px] leading-snug text-faint">
              Knowledge-tracing estimate of the chance you have each skill. Solving updates it up, giving up updates it
              down.
            </p>
          </div>

          {siblings.length > 0 && (
            <div className="panel overflow-hidden">
              <div className="hairline px-4 py-2.5 text-sm font-bold">
                <span className="flex items-center gap-2">
                  <Icon name="Shuffle" size={14} className="text-accent" /> Same idea, different wrapper
                </span>
              </div>
              {siblings.map((p) => (
                <ProblemRow key={p.id} p={p} compact />
              ))}
            </div>
          )}
        </div>
      </div>

      <SolveBar problem={problem} />

      {/* prev / next */}
      <div className="flex items-center justify-between gap-3 pb-4">
        {prev ? (
          <Link href={`/problems/${prev.id}`} className="panel panel-hover flex min-w-0 items-center gap-2 p-3 text-xs">
            <Icon name="ArrowLeft" size={13} className="shrink-0 text-faint" />
            <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/problems/${next.id}`} className="panel panel-hover flex min-w-0 items-center gap-2 p-3 text-xs">
            <span className="truncate">{next.title}</span>
            <Icon name="ArrowRight" size={13} className="shrink-0 text-faint" />
          </Link>
        )}
      </div>
    </div>
  );
}
