"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { DiffBadge, Empty, SectionTitle, Segmented, Stat, cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore } from "@/lib/store/useStore";
import { PROBLEM_MAP, PROBLEMS } from "@/lib/data/problems";
import { TOPIC_MAP } from "@/lib/data/topics";
import type { Problem, ProblemProgress } from "@/lib/types";

/**
 * Everything you wrote down, in one place. Notes taken while solving are the
 * highest value revision material in the app, and they were previously only
 * reachable by navigating back to the exact problem that produced them.
 */

type Tab = "notes" | "starred" | "attempted" | "recent";

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: "notes", label: "Notes", icon: "StickyNote" },
  { value: "starred", label: "Starred", icon: "Star" },
  { value: "attempted", label: "Unfinished", icon: "Flag" },
  { value: "recent", label: "Recent", icon: "Clock" },
];

export default function NotebookPage() {
  const hydrated = useHydrated();
  const progress = useStore((s) => s.progress);
  const recent = useStore((s) => s.recent);
  const [tab, setTab] = useState<Tab>("notes");
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    if (!hydrated) return [] as { problem: Problem; p: ProblemProgress }[];
    return Object.entries(progress)
      .map(([id, p]) => ({ problem: PROBLEM_MAP[id], p }))
      .filter((e) => e.problem);
  }, [progress, hydrated]);

  const withNotes = useMemo(
    () => entries.filter((e) => (e.p.notes ?? "").trim().length > 0).sort((a, b) => (b.p.lastSeen ?? 0) - (a.p.lastSeen ?? 0)),
    [entries],
  );
  const starred = useMemo(() => entries.filter((e) => e.p.starred), [entries]);
  const attempted = useMemo(
    () => entries.filter((e) => e.p.status === "attempted").sort((a, b) => (b.p.lastSeen ?? 0) - (a.p.lastSeen ?? 0)),
    [entries],
  );
  const recentList = useMemo(
    () => (hydrated ? recent.map((id) => ({ problem: PROBLEM_MAP[id], p: progress[id] })).filter((e) => e.problem) : []),
    [recent, progress, hydrated],
  );

  const source = tab === "notes" ? withNotes : tab === "starred" ? starred : tab === "attempted" ? attempted : recentList;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return source;
    return source.filter(
      (e) =>
        e.problem.title.toLowerCase().includes(needle) ||
        (e.p?.notes ?? "").toLowerCase().includes(needle) ||
        e.problem.topic.includes(needle) ||
        e.problem.patterns.some((x) => x.includes(needle)),
    );
  }, [source, q]);

  const words = useMemo(
    () => withNotes.reduce((a, e) => a + (e.p.notes ?? "").trim().split(/\s+/).filter(Boolean).length, 0),
    [withNotes],
  );

  const exportMarkdown = () => {
    const lines = ["# DSA Prep notebook", "", `${withNotes.length} notes, ${words} words.`, ""];
    const byTopic = new Map<string, typeof withNotes>();
    for (const e of withNotes) {
      const k = e.problem.topic;
      if (!byTopic.has(k)) byTopic.set(k, []);
      byTopic.get(k)!.push(e);
    }
    for (const [topic, group] of byTopic) {
      lines.push(`## ${TOPIC_MAP[topic]?.name ?? topic}`, "");
      for (const e of group) {
        lines.push(`### ${e.problem.title} (${e.problem.difficulty})`);
        if (e.problem.links.lc) lines.push(`LeetCode ${e.problem.links.lc}`);
        lines.push("", (e.p.notes ?? "").trim(), "");
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dsa-prep-notebook.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <SectionTitle
        icon="BookOpen"
        title="Notebook"
        sub="Your notes, bookmarks and unfinished problems, collected. This is what you reread the night before an interview."
        right={
          <button onClick={exportMarkdown} disabled={withNotes.length === 0} className="btn !py-1.5 !text-xs">
            <Icon name="Download" size={12} /> Export Markdown
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Notes written" value={withNotes.length} sub={`${words} words`} icon="StickyNote" color="var(--accent)" />
        <Stat label="Starred" value={starred.length} sub="Saved for another look" icon="Star" color="var(--gold)" />
        <Stat label="Unfinished" value={attempted.length} sub="Attempted, not solved" icon="Flag" color="var(--medium)" />
        <Stat label="Coverage" value={`${PROBLEMS.length ? Math.round((withNotes.length / PROBLEMS.length) * 100) : 0}%`} sub="of the bank annotated" icon="BookOpen" color="var(--accent-3)" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented options={TABS} value={tab} onChange={setTab} />
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Icon name="Search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes and titles"
            className="input !py-2 !pl-9 !text-xs"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <Empty
          icon={tab === "notes" ? "StickyNote" : tab === "starred" ? "Star" : "Binoculars"}
          title={q ? "Nothing matches that search" : emptyTitle(tab)}
          body={q ? undefined : emptyBody(tab)}
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {list.map((e, i) => (
              <motion.div
                key={e.problem.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: Math.min(0.2, i * 0.02) }}
              >
                <Entry problem={e.problem} p={e.p} showNote={tab === "notes"} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const emptyTitle = (t: Tab) =>
  t === "notes" ? "No notes yet" : t === "starred" ? "Nothing starred" : t === "attempted" ? "No unfinished problems" : "No history yet";

const emptyBody = (t: Tab) =>
  t === "notes"
    ? "Open any problem and use the notes panel. What tripped you up is worth one line, and it is what you will reread later."
    : t === "starred"
      ? "Star a problem from its page or from any list to keep it here."
      : t === "attempted"
        ? "Problems you mark as attempted but not solved collect here so nothing quietly gets dropped."
        : "Problems you open show up here, newest first.";

function Entry({ problem, p, showNote }: { problem: Problem; p?: ProblemProgress; showNote: boolean }) {
  const [editing, setEditing] = useState(false);
  const topic = TOPIC_MAP[problem.topic];
  const note = (p?.notes ?? "").trim();
  const toggleStar = useStore((s) => s.toggleStar);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${topic?.color}1a`, color: topic?.color }}>
          <Icon name={topic?.icon ?? "ListOrdered"} size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/problems/${problem.id}`} className="block truncate text-sm font-semibold hover:text-accent">
            {problem.title}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-faint">
            <span>{topic?.name}</span>
            <span>·</span>
            <span className="font-mono">tier {problem.tier === 500 ? "vault" : problem.tier}</span>
            {p?.status === "solved" && (
              <>
                <span>·</span>
                <span className="text-easy">solved</span>
              </>
            )}
            {p?.status === "attempted" && (
              <>
                <span>·</span>
                <span className="text-medium">attempted</span>
              </>
            )}
          </div>
        </div>
        <DiffBadge d={problem.difficulty} small />
        <button
          onClick={() => toggleStar(problem.id)}
          className="btn btn-ghost !px-1.5 !py-1"
          aria-label={p?.starred ? "Unstar" : "Star"}
        >
          <Icon name={p?.starred ? "BookmarkCheck" : "Bookmark"} size={14} className={cx(p?.starred && "text-gold")} />
        </button>
        {showNote && (
          <button onClick={() => setEditing((v) => !v)} className="btn !px-2 !py-1 !text-[11px]">
            <Icon name={editing ? "Check" : "Code2"} size={12} />
            {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {showNote && note && !editing && (
        <div className="hairline bg-panel-2/30 px-4 py-3">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-dim">{note}</p>
        </div>
      )}

      {showNote && editing && <NoteEditor key={problem.id} id={problem.id} initial={p?.notes ?? ""} />}
    </div>
  );
}

/** Keyed by problem id so the initial value comes from the initialiser, never an effect. */
function NoteEditor({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const setNote = useStore((s) => s.setNote);
  return (
    <div className="hairline bg-panel-2/30 p-3">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setNote(id, e.target.value);
        }}
        rows={5}
        placeholder="What was the key insight? What did you get wrong the first time?"
        className="input resize-y font-mono !text-xs"
      />
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-faint">
        <span>Saved as you type</span>
        <span>{value.trim().split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
}
