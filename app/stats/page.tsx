"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Bar, CountUp, Ring, SectionTitle, Sparkline, Stat } from "@/components/ui/bits";
import { Heatmap, MasteryRadar } from "@/components/dashboard/widgets";
import { useSnapshot, useTotals } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { TOPICS } from "@/lib/data/topics";
import { PATTERNS } from "@/lib/data/patterns";
import { byPattern, byTopic, PROBLEMS } from "@/lib/data/problems";
import { getMastery } from "@/lib/engine/recommender";
import { masteryColor, masteryLabel, ratingBand } from "@/lib/engine/mastery";
import { levelFromXp, levelTitle } from "@/lib/engine/xp";

export default function StatsPage() {
  const snap = useSnapshot();
  const hydrated = useHydrated();
  const totals = useTotals();
  const xp = useStore((s) => s.xp);
  const rating = useStore((s) => s.rating);
  const ratingHistory = useStore((s) => s.ratingHistory);
  const days = useStore((s) => s.days);
  const streak = useStore((s) => s.streak);
  const reviewCount = useStore((s) => s.reviewCount);

  const lvl = levelFromXp(hydrated ? xp : 0);

  const dayList = useMemo(() => Object.values(days).sort((a, b) => a.date.localeCompare(b.date)), [days]);
  const last30 = dayList.slice(-30);
  const totalMinutes = dayList.reduce((s, d) => s + d.minutes, 0);
  const totalSolvedLogged = dayList.reduce((s, d) => s + d.solved, 0);
  const activeDays = dayList.filter((d) => d.solved > 0 || d.reviewed > 0).length;
  const avgPerActiveDay = activeDays ? totalSolvedLogged / activeDays : 0;

  const topicRows = useMemo(
    () =>
      TOPICS.map((t) => {
        const list = byTopic(t.id);
        const solved = hydrated ? list.filter((p) => snap.progress[p.id]?.status === "solved").length : 0;
        const m = getMastery(snap, t.id);
        return { topic: t, total: list.length, solved, mastery: m.p, seen: m.seen };
      }).sort((a, b) => a.mastery - b.mastery),
    [snap, hydrated],
  );

  const patternRows = useMemo(
    () =>
      PATTERNS.map((p) => {
        const list = byPattern(p.id);
        const solved = hydrated ? list.filter((x) => snap.progress[x.id]?.status === "solved").length : 0;
        return { pattern: p, total: list.length, solved, mastery: getMastery(snap, p.id).p };
      }).sort((a, b) => b.mastery - a.mastery),
    [snap, hydrated],
  );

  const radar = useMemo(
    () => TOPICS.slice(0, 12).map((t) => ({ label: t.name.split(" ")[0], value: getMastery(snap, t.id).p, color: t.color })),
    [snap],
  );

  const projection = useMemo(() => {
    const remaining = PROBLEMS.length - totals.solvedCount;
    const rate = Math.max(0.3, avgPerActiveDay);
    return { remaining, days: Math.ceil(remaining / rate), rate };
  }, [totals.solvedCount, avgPerActiveDay]);

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Your <span className="grad-text">numbers</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          Every solve updates three models: a knowledge-tracing estimate per skill, an Elo rating against problem
          difficulty, and a memory schedule per problem. This is what they currently say.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Problems solved"
          value={<CountUp to={totals.solvedCount} />}
          sub={`${Math.round((totals.solvedCount / PROBLEMS.length) * 100)}% of the bank`}
          icon="CheckCircle2"
          color="var(--easy)"
        />
        <Stat
          label="Rating"
          value={<CountUp to={hydrated ? rating : 1200} />}
          sub={ratingBand(hydrated ? rating : 1200)}
          icon="Gauge"
          color="var(--accent-3)"
        />
        <Stat
          label="Level"
          value={`${lvl.level}`}
          sub={`${levelTitle(lvl.level)} · ${hydrated ? xp : 0} XP`}
          icon="TrendingUp"
          color="var(--accent)"
        />
        <Stat
          label="Time logged"
          value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
          sub={`${activeDays} active days`}
          icon="Clock"
          color="var(--gold)"
        />
      </div>

      <Heatmap weeks={26} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <SectionTitle icon="Activity" title="Rating over time" sub="Elo against problem difficulty, updated on every solve." />
          {hydrated && ratingHistory.length > 1 ? (
            <div className="space-y-2">
              <Sparkline data={ratingHistory.map((r) => r.r)} width={460} height={90} color="var(--accent-3)" />
              <div className="flex justify-between text-[10px] text-faint">
                <span>{new Date(ratingHistory[0].t).toLocaleDateString()}</span>
                <span>
                  {ratingHistory[0].r} → {rating} ({rating - ratingHistory[0].r >= 0 ? "+" : ""}
                  {rating - ratingHistory[0].r})
                </span>
                <span>today</span>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-faint">Solve a few problems to start the curve.</p>
          )}
        </div>

        <div className="panel p-4">
          <SectionTitle icon="CalendarCheck" title="Last 30 days" sub="Problems solved and reviews completed per day." />
          {last30.length > 1 ? (
            <div className="flex h-[110px] items-end gap-[3px]">
              {last30.map((d) => {
                const max = Math.max(1, ...last30.map((x) => x.solved + x.reviewed));
                return (
                  <div key={d.date} className="flex flex-1 flex-col justify-end gap-[2px]" title={`${d.date}: ${d.solved} solved, ${d.reviewed} reviewed`}>
                    <div className="rounded-t-sm" style={{ height: `${(d.reviewed / max) * 100}%`, background: "var(--accent-2)" }} />
                    <div className="rounded-t-sm" style={{ height: `${(d.solved / max) * 100}%`, background: "var(--accent)" }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-faint">Not enough history yet.</p>
          )}
          <div className="mt-2 flex gap-4 text-[10px] text-faint">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-accent" /> solved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-accent-2" /> reviewed
            </span>
            <span className="ml-auto">{reviewCount} reviews lifetime</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <SectionTitle icon="Network" title="Topic mastery, weakest first" sub="Click a row to open the topic and fix it." />
          <div className="panel divide-y divide-line-soft">
            {topicRows.map((r) => (
              <Link key={r.topic.id} href={`/learn/${r.topic.id}`} className="flex items-center gap-3 p-3 hover:bg-panel-2/60">
                <Icon name={r.topic.icon} size={15} style={{ color: r.topic.color }} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">{r.topic.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-faint">
                      {r.solved}/{r.total}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Bar value={r.mastery} color={masteryColor(r.mastery)} height={4} />
                  </div>
                </div>
                <span className="w-[68px] shrink-0 text-right text-[10px]" style={{ color: masteryColor(r.mastery) }}>
                  {masteryLabel(r.mastery)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel grid place-items-center p-4">
            <SectionTitle title="Shape of your skill" />
            <MasteryRadar data={radar} size={290} />
          </div>

          <div className="panel p-4">
            <SectionTitle icon="Rocket" title="Projection" />
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-faint">Remaining</span>
                <span className="font-mono font-bold">{projection.remaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Your pace</span>
                <span className="font-mono font-bold">{projection.rate.toFixed(1)} per active day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Full bank done in</span>
                <span className="font-mono font-bold">
                  {projection.days > 900 ? "a while" : `${projection.days} days`}
                </span>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2">
                <span className="text-faint">Current streak</span>
                <span className="font-mono font-bold text-streak">{hydrated ? streak.current : 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-faint">Best streak</span>
                <span className="font-mono font-bold">{hydrated ? streak.best : 0} days</span>
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <SectionTitle title="Difficulty split" />
            <div className="space-y-2.5">
              {(["Easy", "Medium", "Hard"] as const).map((d) => {
                const color = d === "Easy" ? "var(--easy)" : d === "Medium" ? "var(--medium)" : "var(--hard)";
                return (
                  <div key={d}>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span style={{ color }}>{d}</span>
                      <span className="font-mono text-faint">
                        {totals.byDiff[d]} / {totals.totals[d]}
                      </span>
                    </div>
                    <Bar value={totals.totals[d] ? totals.byDiff[d] / totals.totals[d] : 0} color={color} height={5} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section>
        <SectionTitle icon="Wand2" title="Pattern coverage" sub="Sorted by mastery. The pale ones are where an interview will surprise you." />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {patternRows.map((r) => (
            <Link
              key={r.pattern.id}
              href={`/learn/pattern/${r.pattern.id}`}
              className="panel panel-hover flex items-center gap-3 p-3"
            >
              <Ring value={r.mastery} size={34} stroke={4} color={masteryColor(r.mastery)}>
                <span className="text-[8px] font-bold">{Math.round(r.mastery * 100)}</span>
              </Ring>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium">{r.pattern.name}</div>
                <div className="font-mono text-[10px] text-faint">
                  {r.solved}/{r.total} solved
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
