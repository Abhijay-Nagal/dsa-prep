"use client";

import { useId } from "react";
import type { SceneMotif } from "@/lib/data/palettes";

/**
 * The landscape behind the dashboard hero. Every colour is a theme token
 * (--sky-top, --hill-far, --tree, ...), so one drawing serves all seven themes
 * and switching theme repaints it with no JavaScript. The motif only swaps the
 * foreground: pines, a pagoda, sea cliffs, blossom trees or a moonlit night.
 *
 * Drawn at 1200x300 with the composition on the right and the ranges running
 * off to the left, then anchored bottom-right: a wide hero shows the whole
 * valley, a narrow card keeps the sun and the trees.
 */

const W = 1200;
const H = 300;
/** The composition is drawn in an 800-wide frame, shifted to the right edge. */
const SHIFT = W - 800;

/** A three-tier pine with its base centred on (x, y). */
function pine(x: number, y: number, h: number): string {
  const w = h * 0.42;
  const tiers = [
    [0, 1, 0.55],
    [0.3, 0.8, 0.45],
    [0.55, 0.6, 0.36],
  ];
  const trunk = `M${x - w * 0.05},${y} h${w * 0.1} v${-h * 0.12} h${-w * 0.1}z`;
  return (
    trunk +
    tiers
      .map(([top, width, depth]) => {
        const ty = y - h + top * h;
        const by = ty + depth * h + h * 0.18;
        const half = (w * width) / 2;
        return `M${x},${ty} L${x + half},${by} L${x - half},${by}z`;
      })
      .join(" ")
  );
}

const PINES: [number, number, number][] = [
  [655, 262, 120], [690, 270, 150], [728, 266, 112], [760, 272, 170], [792, 268, 132],
  [600, 266, 70], [628, 270, 88], [520, 258, 46], [540, 260, 56],
];

function Pines() {
  return (
    <g style={{ fill: "var(--tree)" }}>
      {PINES.map(([x, y, h], i) => (
        <path key={i} d={pine(x, y, h)} opacity={h < 60 ? 0.55 : 1} />
      ))}
    </g>
  );
}

function Pagoda() {
  // Three tiers with upturned eaves, standing on the right-hand hill.
  const tiers = [
    { y: 168, w: 92, h: 22 },
    { y: 136, w: 74, h: 20 },
    { y: 106, w: 56, h: 18 },
  ];
  const cx = 690;
  return (
    <g style={{ fill: "var(--tree)" }}>
      <rect x={cx - 34} y={190} width={68} height={70} />
      {tiers.map((t, i) => (
        <g key={i}>
          <path
            d={`M${cx - t.w / 2 - 14},${t.y + t.h} Q${cx - t.w / 2},${t.y + t.h - 6} ${cx - t.w / 3},${t.y} L${cx + t.w / 3},${t.y} Q${cx + t.w / 2},${t.y + t.h - 6} ${cx + t.w / 2 + 14},${t.y + t.h} z`}
          />
          <rect x={cx - t.w / 3 + 4} y={t.y + t.h} width={(t.w * 2) / 3 - 8} height={12} />
        </g>
      ))}
      <rect x={cx - 2} y={80} width={4} height={28} />
      {/* lantern glow in the windows */}
      <rect x={cx - 8} y={204} width={16} height={12} style={{ fill: "var(--sun)" }} opacity={0.85} />
      <rect x={cx - 6} y={180} width={12} height={8} style={{ fill: "var(--sun)" }} opacity={0.6} />
      {(
        [
          [770, 268, 140],
          [797, 272, 112],
          [598, 266, 92],
          [626, 270, 118],
          [548, 262, 60],
        ] as const
      ).map(([x, y, h], i) => (
        <path key={i} d={pine(x, y, h)} />
      ))}
    </g>
  );
}

function Cliffs() {
  return (
    <g>
      <path
        d="M560,300 L560,250 Q575,200 610,190 L640,150 Q660,120 700,118 L740,96 Q780,84 800,90 L800,300 z"
        style={{ fill: "var(--hill-mid)" }}
      />
      <path
        d="M600,300 L605,240 Q630,215 660,206 L700,170 Q740,150 800,150 L800,300 z"
        style={{ fill: "var(--hill-near)" }}
      />
      <g style={{ fill: "var(--tree)" }}>
        <path d={pine(712, 120, 46)} />
        <path d={pine(742, 104, 58)} />
        <path d={pine(772, 96, 50)} />
      </g>
    </g>
  );
}

function Blossom() {
  const trees: [number, number, number][] = [
    [690, 250, 1.1],
    [760, 262, 1.35],
    [600, 262, 0.75],
  ];
  return (
    <g>
      {trees.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            d="M-4,0 L-3,-46 Q-12,-60 -26,-66 M-3,-46 Q4,-62 20,-72 M-3,-30 Q8,-36 18,-38"
            style={{ stroke: "var(--tree)" }}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
          />
          <g style={{ fill: "var(--bloom)" }}>
            <circle cx={-26} cy={-72} r={20} />
            <circle cx={-6} cy={-86} r={24} />
            <circle cx={20} cy={-78} r={22} />
            <circle cx={30} cy={-56} r={16} />
            <circle cx={-34} cy={-52} r={14} />
          </g>
          <g style={{ fill: "var(--sun)" }} opacity={0.55}>
            <circle cx={-14} cy={-92} r={6} />
            <circle cx={14} cy={-84} r={5} />
            <circle cx={-30} cy={-66} r={4} />
          </g>
        </g>
      ))}
    </g>
  );
}

const STARS: [number, number, number][] = [
  [80, 40, 1.2], [160, 70, 0.8], [240, 28, 1], [330, 58, 1.4], [410, 22, 0.9], [470, 74, 1.1],
  [520, 36, 0.7], [700, 30, 1.2], [760, 64, 0.9], [300, 100, 0.7], [120, 110, 0.9], [450, 120, 0.6],
  [860, 46, 1], [940, 90, 0.8], [1110, 30, 1.1], [1160, 80, 0.8], [600, 104, 0.7], [1060, 120, 0.6],
];

export function Scene({ motif, className }: { motif: SceneMotif; className?: string }) {
  const id = useId().replace(/:/g, "");
  const night = motif === "night";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--sky-top)" }} />
          <stop offset="78%" style={{ stopColor: "var(--sky-bottom)" }} />
        </linearGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" style={{ stopColor: "var(--sun)", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "var(--sun)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--water)" }} />
          <stop offset="100%" style={{ stopColor: "var(--hill-mid)" }} />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#sky-${id})`} />

      {night && (
        <g style={{ fill: "var(--sun)" }}>
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity={0.75} />
          ))}
        </g>
      )}

      {/* sun or moon, with its glow, behind everything else */}
      <g transform={`translate(${SHIFT} 0)`}>
        <circle cx={600} cy={night ? 82 : 128} r={110} fill={`url(#glow-${id})`} />
        <circle cx={600} cy={night ? 82 : 128} r={night ? 30 : 38} style={{ fill: "var(--sun)" }} />
        {night && <circle cx={612} cy={74} r={26} style={{ fill: "var(--sky-top)" }} opacity={0.35} />}
        {!night && (
          <g style={{ stroke: "var(--tree)" }} strokeWidth={2} fill="none" opacity={0.45} strokeLinecap="round">
            <path d="M470,70 q6,-6 12,0 q6,-6 12,0" />
            <path d="M505,52 q5,-5 10,0 q5,-5 10,0" />
            <path d="M450,48 q4,-4 8,0 q4,-4 8,0" />
          </g>
        )}
      </g>

      {/* far and middle ranges, the full width */}
      <path
        d="M0,214 L80,180 L170,200 L260,150 L350,196 L400,210 L460,170 L520,192 L600,128 L680,186 L750,150 L830,196 L920,118 L1010,180 L1100,140 L1200,176 L1200,240 L0,240 z"
        style={{ fill: "var(--hill-far)" }}
      />
      <path
        d="M0,232 L70,210 L150,228 L230,204 L320,230 L400,236 L490,196 L570,222 L650,178 L740,226 L820,200 L900,232 L1000,196 L1100,228 L1200,206 L1200,250 L0,250 z"
        style={{ fill: "var(--hill-mid)" }}
        opacity={motif === "cliffs" ? 0.55 : 0.85}
      />

      {/* water */}
      <rect y={236} width={W} height={H - 236} fill={`url(#water-${id})`} />

      {/* the foreground, in the 800-wide frame on the right */}
      <g transform={`translate(${SHIFT} 0)`}>
        <g style={{ fill: "var(--sun)" }} opacity={0.55}>
          <rect x={570} y={246} width={60} height={3} rx={1.5} />
          <rect x={580} y={256} width={40} height={2.5} rx={1.25} />
          <rect x={588} y={265} width={24} height={2} rx={1} />
        </g>
        {motif !== "cliffs" && (
          <path d="M480,300 Q540,262 620,258 Q700,252 800,240 L800,300 z" style={{ fill: "var(--hill-near)" }} />
        )}
        {(motif === "pines" || motif === "night") && <Pines />}
        {motif === "pagoda" && <Pagoda />}
        {motif === "cliffs" && <Cliffs />}
        {motif === "blossom" && <Blossom />}
      </g>
    </svg>
  );
}
