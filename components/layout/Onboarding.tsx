"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore } from "@/lib/store/useStore";
import { COMPANIES } from "@/lib/data/companies";
import { SHEETS } from "@/lib/data/sheets";
import { PROBLEMS } from "@/lib/data/problems";
import { ALGOS } from "@/lib/algo/registry";
import { play } from "@/lib/sound";
import type { Tier } from "@/lib/types";

/**
 * First-run wizard. It exists because the engine is only as good as its priors:
 * a self-reported level seeds the Elo rating and a timeline picks the starting
 * phase, so the very first daily plan is calibrated instead of guessing.
 */

const LEVELS = [
  { id: "new", label: "New to DSA", detail: "Loops and arrays are fine, algorithms are not yet", rating: 950, icon: "Sunrise" },
  { id: "some", label: "Some practice", detail: "Solved a few dozen, patterns still feel unfamiliar", rating: 1160, icon: "Sparkle" },
  { id: "solid", label: "Comfortable", detail: "Mediums are usually fine, hards are hit and miss", rating: 1380, icon: "Gauge" },
  { id: "strong", label: "Strong", detail: "Grinding hards, preparing for senior or FAANG loops", rating: 1600, icon: "Rocket" },
] as const;

const TIMELINES = [
  { id: "sprint", label: "2 weeks", detail: "Interview is imminent", sheet: "blind-75", minutes: 180 },
  { id: "month", label: "1 month", detail: "Focused run at the essentials", sheet: "blind-75", minutes: 120 },
  { id: "quarter", label: "3 months", detail: "Room to build real depth", sheet: "top-150", minutes: 90 },
  { id: "long", label: "6 months or more", detail: "Full syllabus, no rush", sheet: "dsa-450", minutes: 60 },
] as const;

const STEPS = ["Welcome", "You", "Level", "Target", "Pace", "Ready"];

export function Onboarding() {
  const hydrated = useHydrated();
  const onboarded = useStore((s) => s.onboarded);
  const complete = useStore((s) => s.completeOnboarding);
  const skip = useStore((s) => s.skipOnboarding);
  const sound = useStore((s) => s.settings.sound);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["id"]>("some");
  const [timeline, setTimeline] = useState<(typeof TIMELINES)[number]["id"]>("quarter");
  const [company, setCompany] = useState<string | undefined>(undefined);
  const [minutes, setMinutes] = useState(90);
  const [touchedPace, setTouchedPace] = useState(false);

  const chosenLevel = LEVELS.find((l) => l.id === level)!;
  const chosenTimeline = TIMELINES.find((t) => t.id === timeline)!;
  const sheet = SHEETS.find((s) => s.id === chosenTimeline.sheet)!;
  // Until the slider is dragged, the pace follows the timeline they picked.
  const effectiveMinutes = touchedPace ? minutes : chosenTimeline.minutes;
  const perDay = Math.max(1, Math.round(effectiveMinutes / 30));
  const target = sheet.tier === 500 ? PROBLEMS.length : sheet.tier;
  const weeks = Math.max(1, Math.ceil(target / (perDay * 7)));

  const featured = useMemo(() => COMPANIES.slice(0, 12), []);

  const advance = () => {
    play("click", sound);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    complete({
      name: name.trim(),
      targetCompany: company,
      dailyMinutes: effectiveMinutes,
      dailyProblems: Math.max(1, Math.min(8, perDay)),
      sheet: sheet.id,
      tier: sheet.tier as Tier,
      rating: chosenLevel.rating,
    });
    play("level", sound);
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#6d5efc", "#b15cff", "#34d3ff", "#2fd48f", "#ffcc4d"],
      disableForReducedMotion: true,
    });
  };

  if (!hydrated || onboarded) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ background: "color-mix(in srgb, var(--bg) 88%, black)" }}
      />
      {/* drifting accent glow, purely decorative */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{ background: "var(--accent)", opacity: 0.18 }}
        animate={{ x: [-120, 120, -120], y: [-80, 60, -80] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="panel relative w-full max-w-xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-elev)" }}
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
      >
        <div className="hairline flex items-center gap-2 px-5 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl grad-bg">
            <Icon name="Braces" size={16} className="text-white" />
          </div>
          <div className="flex flex-1 items-center gap-1.5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s}
                className="h-1 flex-1 rounded-full"
                style={{ background: i <= step ? "var(--accent)" : "var(--panel-2)" }}
                animate={{ opacity: i <= step ? 1 : 0.6 }}
              />
            ))}
          </div>
          <button onClick={skip} className="btn btn-ghost !px-2 !py-1 !text-[11px]">
            Skip
          </button>
        </div>

        <div className="min-h-[360px] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              {step === 0 && (
                <div className="space-y-4 text-center">
                  <motion.div
                    className="mx-auto grid h-16 w-16 place-items-center rounded-2xl grad-bg shadow-[var(--shadow-glow)]"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon name="Braces" size={30} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Welcome to <span className="grad-text">DSA Prep</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-dim">
                    {PROBLEMS.length} curated problems in five nested phases, {COMPANIES.length} company sheets and{" "}
                    {ALGOS.length} animated algorithms. Five questions and the app builds your plan.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { icon: "Brain", label: "Spaced repetition" },
                      { icon: "Target", label: "Adaptive daily plan" },
                      { icon: "PlayCircle", label: "See every algorithm" },
                    ].map((f) => (
                      <div key={f.label} className="panel flex flex-col items-center gap-1.5 p-3">
                        <Icon name={f.icon} size={16} className="text-accent" />
                        <span className="text-[10px] leading-tight text-dim">{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-faint">
                    Everything stays on this device. No account, no server, works offline.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <StepHead
                    icon="User"
                    title="What should we call you?"
                    sub="Only used to greet you. Leave it blank if you would rather not."
                  />
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && advance()}
                    placeholder="Your name"
                    maxLength={24}
                    className="input !py-3 !text-base"
                  />
                  <div className="panel flex items-start gap-2.5 p-3">
                    <Icon name="Info" size={14} className="mt-0.5 shrink-0 text-accent-3" />
                    <p className="text-[11px] leading-relaxed text-dim">
                      Progress lives in this browser under one key. The profile page exports it as JSON, which is how
                      you move to another device.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <StepHead
                    icon="Gauge"
                    title="Where are you right now?"
                    sub="This seeds your rating, so the first recommendations are not wild guesses."
                  />
                  <div className="space-y-2">
                    {LEVELS.map((l) => (
                      <Choice
                        key={l.id}
                        icon={l.icon}
                        title={l.label}
                        sub={l.detail}
                        right={<span className="font-mono text-[11px] text-faint">{l.rating}</span>}
                        active={level === l.id}
                        onClick={() => {
                          setLevel(l.id);
                          play("click", sound);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <StepHead
                    icon="Building2"
                    title="Any company in mind?"
                    sub="The planner reweights topics towards whatever you pick. Changeable any time."
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {featured.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCompany(company === c.id ? undefined : c.id);
                          play("click", sound);
                        }}
                        className={cx(
                          "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                          company === c.id
                            ? "border-transparent text-white"
                            : "border-line bg-panel-2 text-dim hover:text-text",
                        )}
                        style={company === c.id ? { background: c.color } : undefined}
                      >
                        <span
                          className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold"
                          style={{
                            background: company === c.id ? "#ffffff30" : `${c.color}25`,
                            color: company === c.id ? "#fff" : c.color,
                          }}
                        >
                          {c.short}
                        </span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setCompany(undefined);
                      advance();
                    }}
                    className="text-[11px] text-faint underline decoration-dotted hover:text-dim"
                  >
                    No target yet, keep it general
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <StepHead
                    icon="CalendarCheck"
                    title="How long is your runway?"
                    sub="Sets your starting phase. Phases are nested, so nothing is ever wasted work."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {TIMELINES.map((t) => {
                      const s = SHEETS.find((x) => x.id === t.sheet)!;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTimeline(t.id);
                            play("click", sound);
                          }}
                          className={cx("panel p-3 text-left transition-colors", timeline === t.id ? "border-accent" : "panel-hover")}
                          style={timeline === t.id ? { background: "var(--accent-soft)" } : undefined}
                        >
                          <div className="text-sm font-bold">{t.label}</div>
                          <div className="mt-0.5 text-[10px] leading-tight text-faint">{t.detail}</div>
                          <div className="mt-2 text-[10px] font-semibold" style={{ color: s.color }}>
                            Start at {s.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="panel p-3.5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold">Minutes per day</span>
                      <span className="font-mono text-accent">{effectiveMinutes} min</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={240}
                      step={10}
                      value={effectiveMinutes}
                      onChange={(e) => {
                        setTouchedPace(true);
                        setMinutes(Number(e.target.value));
                      }}
                      className="w-full accent-[var(--accent)]"
                    />
                    <p className="mt-2 text-[11px] text-dim">
                      About {perDay} problems a day, so {sheet.name} takes roughly{" "}
                      <span className="font-semibold text-text">{weeks} weeks</span>.
                    </p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <StepHead
                    icon="Rocket"
                    title={name ? `You are set, ${name}` : "You are set"}
                    sub="Here is what the app just configured. All of it is editable later."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Summary icon="ListChecks" label="Starting phase" value={sheet.name} color={sheet.color} />
                    <Summary icon="Gauge" label="Seed rating" value={String(chosenLevel.rating)} color="var(--accent-3)" />
                    <Summary
                      icon="Building2"
                      label="Target"
                      value={company ? COMPANIES.find((c) => c.id === company)!.name : "General"}
                      color={company ? COMPANIES.find((c) => c.id === company)!.color : "var(--accent-2)"}
                    />
                    <Summary icon="Clock" label="Daily budget" value={`${effectiveMinutes} min`} color="var(--easy)" />
                  </div>
                  <div className="panel space-y-2 p-3.5">
                    <div className="text-xs font-semibold">Three things worth knowing</div>
                    {[
                      "Press Ctrl K to search anything, and ? to see every shortcut.",
                      "The focus timer in the corner logs study minutes towards your streak.",
                      "Solved problems come back for review exactly when you are about to forget them.",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2 text-[11px] leading-relaxed text-dim">
                        <Icon name="Check" size={12} className="mt-0.5 shrink-0 text-easy" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hairline flex items-center justify-between px-5 py-3">
          <button onClick={back} disabled={step === 0} className={cx("btn btn-ghost !text-xs", step === 0 && "invisible")}>
            <Icon name="ArrowLeft" size={13} /> Back
          </button>
          <span className="text-[11px] text-faint">
            {step + 1} of {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button onClick={advance} className="btn btn-primary !text-xs">
              {step === 0 ? "Get started" : "Continue"} <Icon name="ArrowRight" size={13} />
            </button>
          ) : (
            <button onClick={finish} className="btn btn-primary !text-xs">
              Start solving <Icon name="Rocket" size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StepHead({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="space-y-1">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <Icon name={icon} size={17} className="text-accent" />
        {title}
      </h2>
      <p className="text-xs leading-relaxed text-dim">{sub}</p>
    </div>
  );
}

function Choice({
  icon,
  title,
  sub,
  right,
  active,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  right?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        active ? "border-accent" : "border-line bg-panel-2 hover:border-accent/50",
      )}
      style={active ? { background: "var(--accent-soft)" } : undefined}
    >
      <span
        className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg", active ? "text-accent" : "text-faint")}
        style={{ background: "var(--panel)" }}
      >
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-[11px] leading-tight text-faint">{sub}</span>
      </span>
      {right}
      {active && <Icon name="CheckCircle2" size={16} className="shrink-0 text-accent" />}
    </button>
  );
}

function Summary({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="panel flex items-center gap-2.5 p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wider text-faint">{label}</span>
        <span className="block truncate text-sm font-bold">{value}</span>
      </span>
    </div>
  );
}
