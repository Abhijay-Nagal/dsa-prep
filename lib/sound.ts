/**
 * Tiny WebAudio feedback layer. No audio files, no network: every sound is a
 * short synthesised envelope, so it costs nothing to ship and works offline.
 *
 * The context is created lazily on the first call because browsers refuse to
 * start one before a user gesture, and it is never created at all when the
 * user has sound switched off.
 */

type Cue = "solve" | "level" | "achieve" | "tick" | "start" | "done" | "wrong" | "click";

interface Note {
  freq: number;
  /** seconds from the start of the cue */
  at: number;
  dur: number;
  gain: number;
  type?: OscillatorType;
}

/* Cues are written as little arpeggios. Pleasant intervals only: the app plays
   these dozens of times per session, so anything harsh becomes unbearable. */
const CUES: Record<Cue, Note[]> = {
  click: [{ freq: 660, at: 0, dur: 0.05, gain: 0.05, type: "sine" }],
  tick: [{ freq: 880, at: 0, dur: 0.04, gain: 0.035, type: "sine" }],
  solve: [
    { freq: 523.25, at: 0, dur: 0.11, gain: 0.09 },
    { freq: 659.25, at: 0.08, dur: 0.11, gain: 0.09 },
    { freq: 783.99, at: 0.16, dur: 0.18, gain: 0.08 },
  ],
  level: [
    { freq: 523.25, at: 0, dur: 0.12, gain: 0.1 },
    { freq: 659.25, at: 0.1, dur: 0.12, gain: 0.1 },
    { freq: 783.99, at: 0.2, dur: 0.12, gain: 0.1 },
    { freq: 1046.5, at: 0.3, dur: 0.3, gain: 0.09 },
  ],
  achieve: [
    { freq: 783.99, at: 0, dur: 0.1, gain: 0.09 },
    { freq: 1046.5, at: 0.09, dur: 0.1, gain: 0.09 },
    { freq: 1318.5, at: 0.18, dur: 0.26, gain: 0.08 },
  ],
  start: [
    { freq: 440, at: 0, dur: 0.09, gain: 0.07 },
    { freq: 660, at: 0.07, dur: 0.14, gain: 0.07 },
  ],
  done: [
    { freq: 880, at: 0, dur: 0.14, gain: 0.08 },
    { freq: 587.33, at: 0.14, dur: 0.14, gain: 0.08 },
    { freq: 880, at: 0.28, dur: 0.24, gain: 0.08 },
  ],
  wrong: [
    { freq: 233.08, at: 0, dur: 0.16, gain: 0.07, type: "triangle" },
    { freq: 174.61, at: 0.12, dur: 0.22, gain: 0.07, type: "triangle" },
  ],
};

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Plays a cue. Silent and never throws when audio is unavailable or muted. */
export function play(cue: Cue, enabled = true): void {
  if (!enabled) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + 0.01;
  for (const n of CUES[cue]) {
    try {
      const osc = ac.createOscillator();
      const amp = ac.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.value = n.freq;
      // Exponential decay reads as a struck note rather than a beep.
      amp.gain.setValueAtTime(0.0001, t0 + n.at);
      amp.gain.exponentialRampToValueAtTime(n.gain, t0 + n.at + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
      osc.connect(amp).connect(ac.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.02);
    } catch {
      return;
    }
  }
}

/** Short vibration on devices that support it. Used alongside cues on mobile. */
export function buzz(ms: number | number[] = 12): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}
