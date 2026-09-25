"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, Ring, SectionTitle, cx } from "@/components/ui/bits";
import { ProblemList } from "@/components/problems/ProblemList";
import { COMPANY_MAP } from "@/lib/data/companies";
import { companyEntries, companyPhases, companyReadiness } from "@/lib/engine/readiness";
import { useSnapshot } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";
import { TOPIC_MAP } from "@/lib/data/topics";

export default function CompanyDetail() {
  const params = useParams<{ slug: string }>();
  const company = COMPANY_MAP[params.slug];
  const snap = useSnapshot();
  const hydrated = useHydrated();
  const target = useStore((s) => s.settings.targetCompany);
  const setSetting = useStore((s) => s.setSetting);
  const [phase, setPhase] = useState("top-50");

  const entries = useMemo(() => (company ? companyEntries(company) : []), [company]);
  const full = useMemo(() => entries.map((e) => e.problem), [entries]);
  const reportedCount = useMemo(() => entries.filter((e) => e.tagged).length, [entries]);
  const report = useMemo(() => (company ? companyReadiness(snap, company) : null), [company, snap]);
  const phases = useMemo(() => (company ? companyPhases(company) : []), [company]);

  if (!company || !report) return notFound();

  const size = phases.find((p) => p.id === phase)?.size ?? full.length;
  const list = full.slice(0, size);
  const solvedInList = hydrated ? list.filter((p) => snap.progress[p.id]?.status === "solved").length : 0;

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div className="flex items-center gap-2 text-xs text-faint">
        <Link href="/companies" className="hover:text-accent">
          Companies
        </Link>
        <Icon name="ChevronRight" size={12} />
        <span>{company.name}</span>
      </div>

      {/* header */}
      <div className="panel overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${company.color}, transparent)` }}
        />
        <div className="flex flex-wrap items-start gap-5 p-5">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-extrabold"
            style={{ background: `${company.color}22`, color: company.color }}
          >
            {company.short}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{company.name}</h1>
              <Chip color={company.color}>{report.band}</Chip>
              {target === company.id ? (
                <Chip icon="Target" color="var(--accent)">
                  your target
                </Chip>
              ) : (
                <button className="btn !py-1 !text-[11px]" onClick={() => setSetting("targetCompany", company.id)}>
                  <Icon name="Target" size={11} /> Set as target
                </button>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
              <b className="text-text">The bar: </b>
              {company.bar}
            </p>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-faint">{company.hiringNote}</p>
          </div>

          <div className="flex items-center gap-4">
            <Ring value={report.score / 100} size={92} stroke={8} color={company.color}>
              <div className="text-center leading-none">
                <div className="text-lg font-extrabold">{report.score}</div>
                <div className="text-[8px] uppercase tracking-wider text-faint">ready</div>
              </div>
            </Ring>
          </div>
        </div>

        <div className="border-t border-line-soft bg-panel-2/40 px-5 py-3">
          <p className="text-xs text-dim">{report.verdict}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
        {/* left column */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Icon name="ListOrdered" size={14} className="text-accent" /> The loop
            </div>
            <ol className="space-y-3">
              {company.rounds.map((r, i) => (
                <li key={r.name} className="flex gap-3">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold"
                    style={{ background: `${company.color}22`, color: company.color }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{r.name}</div>
                    <p className="mt-0.5 text-[11px] leading-snug text-dim">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Icon name="Lightbulb" size={14} className="text-gold" /> What actually matters here
            </div>
            <ul className="space-y-2">
              {company.tips.map((t) => (
                <li key={t} className="flex gap-2 text-[11.5px] leading-snug text-dim">
                  <Icon name="Check" size={12} className="mt-0.5 shrink-0 text-easy" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-4">
            <div className="mb-3 text-sm font-bold">Difficulty mix they ask</div>
            <div className="flex h-3 overflow-hidden rounded-full">
              <div style={{ width: `${company.mix.easy}%`, background: "var(--easy)" }} />
              <div style={{ width: `${company.mix.medium}%`, background: "var(--medium)" }} />
              <div style={{ width: `${company.mix.hard}%`, background: "var(--hard)" }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-faint">
              <span>{company.mix.easy}% easy</span>
              <span>{company.mix.medium}% medium</span>
              <span>{company.mix.hard}% hard</span>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <div key={d}>
                  <div className="mb-0.5 flex justify-between text-[10px]">
                    <span className="text-faint">your {d.toLowerCase()} coverage</span>
                    <span className="font-mono">{Math.round(report.mixReadiness[d] * 100)}%</span>
                  </div>
                  <Bar
                    value={report.mixReadiness[d]}
                    color={d === "Easy" ? "var(--easy)" : d === "Medium" ? "var(--medium)" : "var(--hard)"}
                    height={4}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <div className="mb-3 text-sm font-bold">Topics they lean on</div>
            <div className="space-y-2">
              {report.topicScores.slice(0, 8).map((t) => (
                <Link key={t.topic} href={`/learn/${t.topic}`} className="block">
                  <div className="mb-0.5 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 truncate" style={{ color: TOPIC_MAP[t.topic]?.color }}>
                      {t.name}
                      <span className="text-faint">weight {Math.round(t.weight * 100)}</span>
                    </span>
                    <span className="font-mono text-faint">
                      {hydrated ? t.solved : 0}/{t.total}
                    </span>
                  </div>
                  <Bar value={t.mastery} color={TOPIC_MAP[t.topic]?.color} height={4} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* right column: the sheet */}
        <div>
          <SectionTitle
            icon="ListChecks"
            title={`${company.name} sheet`}
            sub="Ordered by how much this company cares about the topic, then by how often the problem appears."
            right={
              <span className="font-mono text-[11px] text-faint">
                {solvedInList} / {list.length} solved
              </span>
            }
          />

          <div className="mb-3 flex flex-wrap gap-2">
            {phases.map((p) => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={cx("panel px-3 py-2 text-left transition-colors", phase === p.id && "!border-accent")}
                style={phase === p.id ? { background: "var(--accent-soft)" } : undefined}
              >
                <div className="text-xs font-bold">{p.name}</div>
                <div className="text-[10px] text-faint">{p.id === "full" ? `${full.length} problems` : `${p.size} problems`}</div>
              </button>
            ))}
          </div>

          <div className="mb-3 panel p-3 text-[11px] leading-relaxed text-dim">
            {phases.find((p) => p.id === phase)?.blurb}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Chip color={company.color} icon="Check">
                {reportedCount} reported by candidates
              </Chip>
              {full.length > reportedCount && (
                <Chip icon="Target">
                  {full.length - reportedCount} matched to their focus topics
                </Chip>
              )}
            </div>
          </div>

          <ProblemList problems={list} numbered emptyNote="No tagged problems match those filters." />
        </div>
      </div>
    </div>
  );
}
