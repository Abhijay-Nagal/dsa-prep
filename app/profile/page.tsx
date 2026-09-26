"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, Modal, Ring, SectionTitle, Segmented, cx } from "@/components/ui/bits";
import { ACHIEVEMENTS, TIER_COLOR } from "@/lib/engine/achievements";
import { useStore } from "@/lib/store/useStore";
import { PALETTES } from "@/lib/data/palettes";
import { useHydrated } from "@/components/layout/Shell";
import { levelFromXp, levelTitle } from "@/lib/engine/xp";
import { ratingBand } from "@/lib/engine/mastery";
import { COMPANIES } from "@/lib/data/companies";
import { SHEETS } from "@/lib/data/sheets";



export default function ProfilePage() {
  const hydrated = useHydrated();
  const store = useStore();
  const {
    settings, xp, rating, achievements, streak, vizWatched, arenaWins, bestQuiz, reviewCount,
    setSetting, resetAll, exportState, importState, achievementInput,
  } = store;
  const [confirmReset, setConfirmReset] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [tab, setTab] = useState<"achievements" | "settings" | "data">("achievements");
  const fileRef = useRef<HTMLInputElement>(null);

  const lvl = levelFromXp(hydrated ? xp : 0);
  const input = useMemo(() => (hydrated ? achievementInput() : null), [hydrated, achievementInput]);
  const earned = useMemo(() => new Set(hydrated ? achievements : []), [hydrated, achievements]);

  const rows = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => ({
        a,
        got: earned.has(a.id),
        progress: input ? Math.min(1, a.progress(input)) : 0,
      })).sort((x, y) => Number(y.got) - Number(x.got) || y.progress - x.progress),
    [input, earned],
  );

  const download = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-7">
      {/* header */}
      <div className="panel overflow-hidden">
        <div className="h-20 grad-bg opacity-80" />
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="-mt-9">
            <Ring value={lvl.pct} size={84} stroke={7} color="var(--accent)" glow={false}>
              <div
                className="grid h-[62px] w-[62px] place-items-center rounded-full text-xl font-extrabold"
                style={{ background: "var(--bg-elev)" }}
              >
                {lvl.level}
              </div>
            </Ring>
          </div>
          <div className="min-w-0 flex-1">
            <input
              value={settings.name}
              onChange={(e) => setSetting("name", e.target.value)}
              placeholder="Add your name"
              className="w-full max-w-[260px] bg-transparent text-xl font-extrabold tracking-tight outline-none placeholder:text-faint"
            />
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Chip color="var(--accent)">{levelTitle(lvl.level)}</Chip>
              <Chip icon="Gauge">{hydrated ? rating : 1200} · {ratingBand(hydrated ? rating : 1200)}</Chip>
              <Chip icon="Flame" color="var(--streak)">
                {hydrated ? streak.current : 0} day streak
              </Chip>
              <Chip icon="Trophy" color="var(--gold)">
                {earned.size} / {ACHIEVEMENTS.length} badges
              </Chip>
            </div>
          </div>
          <div className="w-full sm:w-52">
            <div className="mb-1 flex justify-between text-[10px] text-faint">
              <span>level {lvl.level}</span>
              <span className="font-mono">
                {lvl.into}/{lvl.span} XP
              </span>
            </div>
            <Bar value={lvl.pct} height={6} />
          </div>
        </div>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "achievements", label: "Achievements", icon: "Trophy" },
          { value: "settings", label: "Settings", icon: "Settings" },
          { value: "data", label: "Your data", icon: "Download" },
        ]}
      />

      {tab === "achievements" && (
        <section>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Visualisers watched", value: hydrated ? vizWatched.length : 0, icon: "PlayCircle" },
              { label: "Arena wins", value: hydrated ? arenaWins : 0, icon: "Swords" },
              { label: "Best quiz", value: `${hydrated ? bestQuiz : 0}%`, icon: "BadgeCheck" },
              { label: "Reviews done", value: hydrated ? reviewCount : 0, icon: "Repeat" },
            ].map((s) => (
              <div key={s.label} className="panel p-3">
                <Icon name={s.icon} size={14} className="text-accent" />
                <div className="mt-1 text-lg font-bold">{s.value}</div>
                <div className="text-[10px] text-faint">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ a, got, progress }, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(0.3, i * 0.02) }}
                className={cx("panel p-3.5", !got && "opacity-75")}
                style={got ? { borderColor: `${TIER_COLOR[a.tier]}66` } : undefined}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: got ? `${TIER_COLOR[a.tier]}22` : "var(--panel-2)",
                      color: got ? TIER_COLOR[a.tier] : "var(--text-faint)",
                    }}
                  >
                    <Icon name={got ? a.icon : a.secret ? "Lock" : a.icon} size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold">{a.secret && !got ? "Secret badge" : a.name}</span>
                      {got && <Icon name="Check" size={12} style={{ color: TIER_COLOR[a.tier] }} />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-dim">
                      {a.secret && !got ? "Keep going and it will unlock itself." : a.desc}
                    </p>
                    {!got && !a.secret && (
                      <div className="mt-2">
                        <Bar value={progress} color={TIER_COLOR[a.tier]} height={3} />
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider" style={{ color: TIER_COLOR[a.tier] }}>
                    {a.tier}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {tab === "settings" && (
        <section className="space-y-4">
          <div className="panel p-5">
            <SectionTitle icon="Target" title="Goals" sub="These drive the daily plan, the streak and the perfect-day achievements." />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Minutes per day</span>
                <input
                  type="range"
                  min={15}
                  max={300}
                  step={15}
                  value={settings.dailyMinutes}
                  onChange={(e) => setSetting("dailyMinutes", Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <span className="font-mono text-[11px] text-faint">{settings.dailyMinutes} minutes</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Problems per day</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={settings.dailyProblems}
                  onChange={(e) => setSetting("dailyProblems", Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <span className="font-mono text-[11px] text-faint">{settings.dailyProblems} problems</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Active phase</span>
                <select
                  value={settings.activeSheet}
                  onChange={(e) => {
                    const sheet = SHEETS.find((s) => s.id === e.target.value)!;
                    setSetting("activeSheet", sheet.id);
                    setSetting("activeTier", sheet.tier);
                  }}
                  className="input !text-sm"
                >
                  {SHEETS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Target company</span>
                <select
                  value={settings.targetCompany ?? ""}
                  onChange={(e) => setSetting("targetCompany", e.target.value || undefined)}
                  className="input !text-sm"
                >
                  <option value="">No specific target</option>
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="panel p-5">
            <SectionTitle icon="Sparkles" title="Appearance" />
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-xs font-semibold">Theme</span>
                <Segmented
                  value={settings.theme}
                  onChange={(v) => setSetting("theme", v)}
                  options={[
                    { value: "dark", label: "Dark", icon: "MoonStar" },
                    { value: "light", label: "Light", icon: "Sun" },
                  ]}
                />
              </div>
              <div>
                <span className="mb-1 block text-xs font-semibold">Palette</span>
                <p className="mb-2.5 text-[11px] text-faint">
                  Each one changes the background family as well as the accents. Difficulty colours never change.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PALETTES.map((pal) => {
                    const active = settings.palette === pal.id;
                    return (
                      <button
                        key={pal.id}
                        onClick={() => setSetting("palette", pal.id)}
                        className={cx(
                          "overflow-hidden rounded-xl border-2 text-left transition-transform hover:-translate-y-0.5",
                          active ? "border-accent" : "border-line",
                        )}
                        title={pal.blurb}
                      >
                        <span
                          className="flex h-10 items-end gap-1 p-2"
                          style={{ background: pal.bg }}
                        >
                          {pal.swatch.map((c) => (
                            <span key={c} className="h-4 flex-1 rounded" style={{ background: c }} />
                          ))}
                        </span>
                        <span className="flex items-center gap-1.5 bg-panel-2 px-2.5 py-1.5">
                          <span className="flex-1 truncate text-xs font-semibold">{pal.name}</span>
                          {active && <Icon name="Check" size={13} className="shrink-0 text-accent" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => setSetting("reduceMotion", e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  Reduce confetti and large animations
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.showHintsFirst}
                    onChange={(e) => setSetting("showHintsFirst", e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  Expand hints by default
                </label>
              </div>
              <div>
                <span className="mb-2 block text-xs font-semibold">Preferred language in the scratchpad</span>
                <Segmented
                  size="sm"
                  value={settings.language}
                  onChange={(v) => setSetting("language", v)}
                  options={[
                    { value: "javascript", label: "JavaScript" },
                    { value: "python", label: "Python" },
                    { value: "cpp", label: "C++" },
                    { value: "java", label: "Java" },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "data" && (
        <section className="space-y-4">
          <div className="panel p-5">
            <SectionTitle
              icon="Download"
              title="Everything stays on this device"
              sub="Progress lives in your browser. No account, no server. Export it if you switch machines."
            />
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={download}>
                <Icon name="Download" size={14} /> Export progress
              </button>
              <button className="btn" onClick={() => setImportOpen(true)}>
                <Icon name="Upload" size={14} /> Import progress
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const text = await f.text();
                  setImportText(text);
                  setImportOpen(true);
                }}
              />
              <button className="btn" onClick={() => fileRef.current?.click()}>
                <Icon name="Upload" size={14} /> From file
              </button>
            </div>
          </div>

          <div className="panel p-5">
            <SectionTitle icon="AlertTriangle" title="Reset" sub="Clears every solve, note, rating and badge on this device. Export first." />
            <button className="btn !border-hard !text-hard" onClick={() => setConfirmReset(true)}>
              <Icon name="Trash2" size={14} /> Reset all progress
            </button>
          </div>

          <div className="panel p-5 text-xs leading-relaxed text-dim">
            <div className="mb-2 text-sm font-bold text-text">What this app stores</div>
            <ul className="space-y-1.5">
              <li>Solve status, attempts, confidence and time spent per problem.</li>
              <li>A spaced repetition card per solved problem: stability, difficulty, due date.</li>
              <li>A knowledge-tracing probability per topic and per pattern.</li>
              <li>Your Elo rating history, XP, streak, badges and per-day activity log.</li>
              <li>Notes and scratchpad code you type, per problem and per language.</li>
            </ul>
          </div>
        </section>
      )}

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset everything?">
        <p className="text-sm text-dim">
          This clears all {hydrated ? Object.keys(store.progress).length : 0} tracked problems, your rating, streak,
          badges and notes. It cannot be undone.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            className="btn !border-hard !text-hard"
            onClick={() => {
              resetAll();
              setConfirmReset(false);
            }}
          >
            Yes, reset
          </button>
          <button className="btn" onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
        </div>
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import progress" wide>
        <p className="text-sm text-dim">Paste an exported JSON file. This replaces your current progress.</p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={10}
          className="input mt-3 font-mono text-[11px]"
          placeholder='{ "version": 1, "progress": { ... } }'
        />
        {importMsg && <p className="mt-2 text-xs text-hard">{importMsg}</p>}
        <div className="mt-3 flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              const ok = importState(importText);
              if (ok) {
                setImportOpen(false);
                setImportText("");
                setImportMsg("");
              } else {
                setImportMsg("That did not parse as a valid export.");
              }
            }}
          >
            Import
          </button>
          <button className="btn" onClick={() => setImportOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
