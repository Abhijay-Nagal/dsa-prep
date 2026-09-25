"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge, Ring, SectionTitle } from "@/components/ui/bits";
import { ProblemList } from "@/components/problems/ProblemList";
import { TOPICS, TOPIC_MAP, topicPath } from "@/lib/data/topics";
import { PATTERNS } from "@/lib/data/patterns";
import { byTopic } from "@/lib/data/problems";
import { algosForTopic } from "@/lib/algo/registry";
import { getMastery } from "@/lib/engine/recommender";
import { useSnapshot } from "@/hooks/useLearner";
import { masteryColor, masteryLabel, predictCorrect } from "@/lib/engine/mastery";
import { useHydrated } from "@/components/layout/Shell";

export default function TopicPage() {
  const params = useParams<{ topic: string }>();
  const topic = TOPIC_MAP[params.topic];
  const snap = useSnapshot();
  const hydrated = useHydrated();

  const problems = useMemo(() => (topic ? byTopic(topic.id) : []), [topic]);
  const vizzes = useMemo(() => (topic ? algosForTopic(topic.id) : []), [topic]);
  const patterns = useMemo(() => (topic ? PATTERNS.filter((p) => p.topic === topic.id) : []), [topic]);

  if (!topic) return notFound();

  const mastery = getMastery(snap, topic.id);
  const solved = hydrated ? problems.filter((p) => snap.progress[p.id]?.status === "solved").length : 0;
  const path = topicPath();
  const idx = path.indexOf(topic.id);
  const nextTopic = path[idx + 1] ? TOPIC_MAP[path[idx + 1]] : undefined;
  const unlocks = TOPICS.filter((t) => t.prereq.includes(topic.id));

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div className="flex items-center gap-2 text-xs text-faint">
        <Link href="/learn" className="hover:text-accent">
          Learn
        </Link>
        <Icon name="ChevronRight" size={12} />
        <span>{topic.name}</span>
      </div>

      {/* header */}
      <div className="panel overflow-hidden">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${topic.color}, transparent)` }} />
        <div className="flex flex-wrap items-center gap-5 p-5">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
            style={{ background: `${topic.color}22`, color: topic.color }}
          >
            <Icon name={topic.icon} size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">{topic.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-dim">{topic.blurb}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip color={masteryColor(mastery.p)}>{masteryLabel(mastery.p)}</Chip>
              <Chip icon="TrendingUp">interview weight {Math.round(topic.interviewWeight * 100)}</Chip>
              <Chip icon="ListOrdered">{problems.length} problems</Chip>
              <Chip icon="PlayCircle">{vizzes.length} visualisers</Chip>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Ring value={mastery.p} size={92} stroke={8} color={masteryColor(mastery.p)}>
              <div className="text-center leading-none">
                <div className="text-lg font-extrabold">{Math.round(mastery.p * 100)}</div>
                <div className="text-[8px] uppercase tracking-wider text-faint">mastery</div>
              </div>
            </Ring>
          </div>
        </div>
        <div className="grid gap-3 border-t border-line-soft bg-panel-2/30 px-5 py-3 text-[11px] sm:grid-cols-3">
          <div>
            <span className="text-faint">Attempts logged</span>
            <div className="font-mono font-bold">{mastery.seen}</div>
          </div>
          <div>
            <span className="text-faint">Predicted success on the next one</span>
            <div className="font-mono font-bold">{Math.round(predictCorrect(mastery) * 100)}%</div>
          </div>
          <div>
            <span className="text-faint">Solved here</span>
            <div className="font-mono font-bold">
              {solved} / {problems.length}
            </div>
          </div>
        </div>
      </div>

      {/* key ideas + prereqs */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel p-5">
          <SectionTitle icon="Lightbulb" title="What you actually need to hold in your head" />
          <ul className="space-y-2.5">
            {topic.keyIdeas.map((k) => (
              <li key={k} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: topic.color }} />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {topic.prereq.length > 0 && (
            <div className="panel p-4">
              <div className="mb-2 text-sm font-bold">Comfortable with these first</div>
              <div className="space-y-2">
                {topic.prereq.map((p) => {
                  const t = TOPIC_MAP[p];
                  const m = getMastery(snap, p);
                  return (
                    <Link key={p} href={`/learn/${p}`} className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-panel-2">
                      <Icon name={t.icon} size={14} style={{ color: t.color }} />
                      <span className="min-w-0 flex-1 truncate text-xs">{t.name}</span>
                      <span className="font-mono text-[10px]" style={{ color: masteryColor(m.p) }}>
                        {Math.round(m.p * 100)}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {unlocks.length > 0 && (
            <div className="panel p-4">
              <div className="mb-2 text-sm font-bold">This unlocks</div>
              <div className="flex flex-wrap gap-1.5">
                {unlocks.map((t) => (
                  <Link key={t.id} href={`/learn/${t.id}`}>
                    <Chip color={t.color} icon={t.icon}>
                      {t.name}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {nextTopic && (
            <Link href={`/learn/${nextTopic.id}`} className="panel panel-hover flex items-center gap-3 p-4">
              <Icon name={nextTopic.icon} size={18} style={{ color: nextTopic.color }} />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-faint">Next in the path</div>
                <div className="truncate text-sm font-bold">{nextTopic.name}</div>
              </div>
              <Icon name="ArrowRight" size={15} className="ml-auto shrink-0 text-faint" />
            </Link>
          )}
        </div>
      </div>

      {/* visualisers */}
      {vizzes.length > 0 && (
        <section>
          <SectionTitle icon="PlayCircle" title="Watch it run" sub="Step through the algorithm before you write it." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vizzes.map((a) => (
              <Link key={a.slug} href={`/visualize/${a.slug}`} className="panel panel-hover flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold">{a.name}</span>
                  <DiffBadge d={a.difficulty} small />
                </div>
                <p className="text-[11.5px] leading-snug text-dim">{a.blurb}</p>
                <div className="mt-auto flex items-center gap-2 text-[10px] text-faint">
                  <Icon name="Play" size={11} className="text-accent" />
                  <span className="font-mono">{a.complexity.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* patterns */}
      {patterns.length > 0 && (
        <section>
          <SectionTitle icon="Wand2" title="Patterns in this topic" sub="The trigger phrases are what you are training yourself to notice." />
          <div className="grid gap-3 md:grid-cols-2">
            {patterns.map((p) => (
              <Link key={p.id} href={`/learn/pattern/${p.id}`} className="panel panel-hover p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="font-mono text-[10px] text-faint">{p.complexity}</span>
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-dim">{p.idea}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.triggers.slice(0, 2).map((t) => (
                    <span key={t} className="chip !text-[9px] !italic">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* problems */}
      <section>
        <SectionTitle title={`${topic.name} problems`} sub="Ordered by sheet phase, so the early ones are the highest signal." />
        <ProblemList problems={problems} />
      </section>
    </div>
  );
}
