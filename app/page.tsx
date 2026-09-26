"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, CountUp, DiffBadge, Empty, SectionTitle, Stat, cx } from "@/components/ui/bits";
import { LevelCard, MasteryRadar, RecommendationCard, SkillGapList, StreakCard } from "@/components/dashboard/widgets";
import { DailyCard, WeeklySpotlight } from "@/components/dashboard/daily";
import { useNow } from "@/hooks/useNow";
import { useOrigin } from "@/components/ui/PageNav";
import { ProblemRow } from "@/components/problems/ProblemList";
import { useDailyPlan, useDueReviews, useRecommendations, useSheetStats, useSnapshot, useTotals, useWeakSkills } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { SHEET_MAP, SHEETS } from "@/lib/data/sheets";
import { COMPANIES, COMPANY_MAP } from "@/lib/data/companies";
import { companyReadiness } from "@/lib/engine/readiness";
import { mustDo, PROBLEMS } from "@/lib/data/problems";
import { TOPICS, TOPIC_MAP } from "@/lib/data/topics";
import { getMastery } from "@/lib/engine/recommender";
import { ALGOS } from "@/lib/algo/registry";

/** Pure in `now` so the server and client agree. `now` is 0 until hydration. */
function greeting(now: number) {
  if (!now) return "Welcome back";
  const h = new Date(now).getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late session";
}

export default function Dashboard() {
  const snap = useSnapshot();
  const plan = useDailyPlan();
  const recs = useRecommendations(6);
  const due = useDueReviews();
  const gaps = useWeakSkills(5);
  const sheets = useSheetStats();
  const totals = useTotals();
  const name = useStore((s) => s.settings.name);
  const activeSheet = useStore((s) => s.settings.activeSheet);
  const targetCompany = useStore((s) => s.settings.targetCompany);
  const setSetting = useStore((s) => s.setSetting);
  const dailyMinutes = useStore((s) => s.settings.dailyMinutes);
  const now = useNow();
  useOrigin("/", "Today’s plan");

  const sheet = SHEET_MAP[activeSheet] ?? SHEETS[0];
  const active = sheets.find((s) => s.sheet.id === sheet.id)!;

  const readiness = useMemo(
    () => (targetCompany && COMPANY_MAP[targetCompany] ? companyReadiness(snap, COMPANY_MAP[targetCompany]) : null),
    [snap, targetCompany],
  );

  const radar = useMemo(
    () =>
      TOPICS.filter((t) => t.interviewWeight >= 0.6)
        .slice(0, 10)
        .map((t) => ({ label: t.name.split(" ")[0], value: getMastery(snap, t.id).p, color: t.color })),
    [snap],
  );

  const criticals = useMemo(() => mustDo().filter((p) => snap.progress[p.id]?.status !== "solved").slice(0, 6), [snap]);
  const featuredViz = useMemo(() => ALGOS.slice(0, 4), []);

  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      {/* hero */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold tracking-tight sm:text-[28px]"
          >
            {greeting(now)}
            {name ? `, ${name}` : ""}. <span className="grad-text">Here is today.</span>
          </motion.h1>
          <p className="mt-1 text-sm text-dim">
            Phase {sheet.name} · {active.solved} of {active.total} solved · plan sized for {dailyMinutes} minutes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/revise" className={cx("btn", due.length > 0 && "btn-primary")}>
            <Icon name="Repeat" size={14} />
            Review {due.length > 0 ? `(${due.length})` : ""}
          </Link>
          <Link href="/arena" className="btn">
            <Icon name="Swords" size={14} /> Mock round
          </Link>
        </div>
      </div>

      <DailyCard />

      {/* top stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StreakCard />
        <LevelCard />
        <Stat
          label="Solved"
          value={<><CountUp to={totals.solvedCount} /> <span className="text-base font-normal text-faint">/ {totals.total}</span></>}
          sub={`${totals.byDiff.Easy} easy · ${totals.byDiff.Medium} medium · ${totals.byDiff.Hard} hard`}
          icon="CheckCircle2"
          color="var(--easy)"
        />
        <Stat
          label="Due for review"
          value={<CountUp to={due.length} />}
          sub={due.length ? "Forgetting curve says now" : "Nothing slipping yet"}
          icon="Brain"
          color="var(--accent-2)"
        />
      </div>

      {/* today's plan */}
      <section>
        <SectionTitle
          icon="Target"
          title="Today's plan"
          sub="Built by fitting the highest-value problems into the time you have, reviews first."
          right={
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-faint">Budget</span>
              <select
                value={dailyMinutes}
                onChange={(e) => setSetting("dailyMinutes", Number(e.target.value))}
                className="input !w-auto !py-1.5 !text-xs"
              >
                {[30, 45, 60, 90, 120, 180, 240].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="panel overflow-hidden">
            {plan.reviews.length > 0 && (
              <>
                <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2/40 px-4 py-2 text-xs font-bold">
                  <Icon name="Repeat" size={12} className="text-accent-2" />
                  Review first
                  <span className="ml-auto font-mono text-[10px] text-faint">{plan.reviewMinutes} min</span>
                </div>
                {plan.reviews.slice(0, 4).map((p) => (
                  <ProblemRow key={p.id} p={p} compact />
                ))}
              </>
            )}
            <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2/40 px-4 py-2 text-xs font-bold">
              <Icon name="Sparkles" size={12} className="text-accent" />
              New work
              <span className="ml-auto font-mono text-[10px] text-faint">
                {plan.minutes - plan.reviewMinutes} min
              </span>
            </div>
            {plan.newWork.length === 0 ? (
              <div className="p-6 text-center text-sm text-faint">
                Raise the time budget or move to the next phase to unlock more problems.
              </div>
            ) : (
              plan.newWork.map((p, i) => <ProblemRow key={p.id} p={p} index={i} compact />)
            )}
            {plan.stretch && (
              <>
                <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2/40 px-4 py-2 text-xs font-bold">
                  <Icon name="Mountain" size={12} className="text-hard" />
                  Stretch problem
                  <span className="ml-auto text-[10px] font-normal text-faint">
                    Above your comfort zone on purpose
                  </span>
                </div>
                <ProblemRow p={plan.stretch} compact />
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="panel p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">Budget filled</span>
                <span className="font-mono text-faint">
                  {plan.minutes} / {dailyMinutes} min
                </span>
              </div>
              <Bar value={plan.fill} height={7} />
              <p className="mt-3 text-[11px] leading-relaxed text-dim">
                Reviews are scheduled by a free-spaced-repetition scheduler, and the rest is a knapsack fill over your
                remaining minutes. Problems are scored by how close they sit to a 70 percent chance of you solving them.
              </p>
            </div>

            <div className="panel p-4">
              <div className="mb-3 text-xs font-semibold">Phase progress</div>
              <div className="space-y-2.5">
                {sheets.map(({ sheet: sh, solved, total, pct }) => (
                  <Link key={sh.id} href={`/sheets/${sh.id}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className={cx("font-medium", sh.id === sheet.id && "text-accent")}>
                        {sh.name}
                        {sh.id === sheet.id && " (active)"}
                      </span>
                      <span className="font-mono text-faint">
                        {solved}/{total}
                      </span>
                    </div>
                    <Bar value={pct} color={sh.color} height={5} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* recommendations */}
      <section>
        <SectionTitle
          icon="Wand2"
          title="Recommended next"
          sub="Scored on pattern mastery, your rating, interview frequency and your target company."
          right={
            <Link href="/problems" className="btn !py-1.5 !text-xs">
              Browse all <Icon name="ArrowRight" size={12} />
            </Link>
          }
        />
        {recs.length === 0 ? (
          <Empty title="Nothing left in this phase" body="Move up to the next sheet to keep going." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((r, i) => (
              <RecommendationCard key={r.problem.id} problem={r.problem} reason={r.reason} score={r.score} rank={i} />
            ))}
          </div>
        )}
      </section>

      {/* weekly spotlight + quick jumps */}
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <SectionTitle
            icon="Compass"
            title="This week"
            sub="One topic in the spotlight per week, with the visualiser and the five problems that matter most."
          />
          <WeeklySpotlight />
        </div>
        <div>
          <SectionTitle icon="Sparkles" title="Tools" sub="The parts people forget exist." />
          <div className="panel divide-y divide-[var(--line-soft)]">
            {[
              { href: "/roadmap", icon: "Map", label: "Syllabus roadmap", sub: "What to learn before what" },
              { href: "/visualize/compare", icon: "Swords", label: "Algorithm race", sub: "Two algorithms, one input" },
              { href: "/learn/complexity", icon: "Gauge", label: "Complexity explorer", sub: "Drag n, watch it break" },
              { href: "/notebook", icon: "BookOpen", label: "Notebook", sub: "Every note you have written" },
              { href: "/arena", icon: "Swords", label: "Arena", sub: "Timed rounds and drills" },
            ].map((t) => (
              <Link key={t.href} href={t.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel-2/50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel-2 text-accent">
                  <Icon name={t.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.label}</span>
                  <span className="block truncate text-[11px] text-faint">{t.sub}</span>
                </span>
                <Icon name="ChevronRight" size={14} className="shrink-0 text-faint" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* readiness + gaps */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle icon="Building2" title="Interview readiness" sub="Pick a target and the whole app reorders around it." />
          {readiness && targetCompany ? (
            <div className="panel p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg width={92} height={92} className="-rotate-90">
                    <circle cx={46} cy={46} r={38} fill="none" stroke="var(--panel-2)" strokeWidth={9} />
                    <motion.circle
                      cx={46}
                      cy={46}
                      r={38}
                      fill="none"
                      stroke={COMPANY_MAP[targetCompany].color}
                      strokeWidth={9}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 38}
                      initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - readiness.score / 100) }}
                      transition={{ type: "spring", stiffness: 70, damping: 18 }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center leading-none">
                      <div className="text-xl font-extrabold">{readiness.score}</div>
                      <div className="text-[8px] uppercase tracking-wider text-faint">of 100</div>
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{COMPANY_MAP[targetCompany].name}</span>
                    <Chip color={COMPANY_MAP[targetCompany].color}>{readiness.band}</Chip>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-dim">{readiness.verdict}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {readiness.gaps.slice(0, 3).map((g) => (
                      <Chip key={g.topic} color="var(--hard)">
                        {g.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                <span className="text-[11px] text-faint">
                  {readiness.daysToReady > 0
                    ? `About ${readiness.daysToReady} days at your current pace`
                    : "You are at the bar"}
                </span>
                <Link href={`/companies/${targetCompany}`} className="btn !py-1 !text-[11px]">
                  Open sheet <Icon name="ArrowRight" size={11} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="panel p-4">
              <p className="text-sm text-dim">Choose a target company to get a readiness score and a reordered plan.</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {COMPANIES.slice(0, 10).map((c) => (
                  <button key={c.id} className="chip cursor-pointer hover:border-accent" onClick={() => setSetting("targetCompany", c.id)}>
                    {c.name}
                  </button>
                ))}
                <Link href="/companies" className="chip cursor-pointer hover:border-accent">
                  All {COMPANIES.length} →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-4">
            <SectionTitle icon="AlertTriangle" title="Weakest right now" sub="Ranked by mastery gap times interview weight." />
            <SkillGapList gaps={gaps} />
          </div>
        </div>

        <div>
          <SectionTitle icon="Activity" title="Topic mastery" sub="Bayesian knowledge tracing across the topics that matter most." />
          <div className="panel grid place-items-center p-4">
            <MasteryRadar data={radar} size={280} />
          </div>

          <div className="mt-4">
            <SectionTitle icon="Star" title="Critical, still unsolved" sub="High frequency problems flagged as non-negotiable." />
            <div className="panel overflow-hidden">
              {criticals.length === 0 ? (
                <div className="p-6 text-center text-sm text-easy">Every must-do problem is done. Genuinely impressive.</div>
              ) : (
                criticals.map((p) => <ProblemRow key={p.id} p={p} compact />)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* visualisers */}
      <section>
        <SectionTitle
          icon="PlayCircle"
          title="See it move"
          sub={`${ALGOS.length} step-by-step visualisers with narration, pseudocode tracing and editable input.`}
          right={
            <Link href="/visualize" className="btn !py-1.5 !text-xs">
              All visualisers <Icon name="ArrowRight" size={12} />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredViz.map((a) => (
            <Link key={a.slug} href={`/visualize/${a.slug}`} className="panel panel-hover flex flex-col gap-2 p-3.5">
              <div className="flex items-center justify-between">
                <Icon name={TOPIC_MAP[a.topic]?.icon ?? "PlayCircle"} size={16} style={{ color: TOPIC_MAP[a.topic]?.color }} />
                <DiffBadge d={a.difficulty} small />
              </div>
              <div className="text-sm font-semibold">{a.name}</div>
              <p className="line-clamp-2 text-[11px] leading-snug text-dim">{a.blurb}</p>
              <div className="mt-auto flex items-center gap-1.5 text-[10px] text-faint">
                <Icon name="Clock" size={10} />
                <span className="font-mono">{a.complexity.time}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* footer strip */}
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-xs text-dim">
        <span>
          {PROBLEMS.length} problems · {SHEETS.length} nested phases · {COMPANIES.length} company sheets ·{" "}
          {ALGOS.length} visualisers
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="Download" size={12} /> Installable and works offline
        </span>
      </div>
    </div>
  );
}
