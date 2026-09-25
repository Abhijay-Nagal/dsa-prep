"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* --------------------------------- progress -------------------------------- */

export function Bar({
  value,
  color = "var(--accent)",
  height = 8,
  showTrack = true,
  label,
  className,
}: {
  value: number;
  color?: string;
  height?: number;
  showTrack?: boolean;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cx("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-[11px] text-dim">
          <span>{label}</span>
          <span className="font-mono">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cx("w-full overflow-hidden rounded-full", showTrack && "bg-panel-2")}
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px -2px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function Ring({
  value,
  size = 84,
  stroke = 8,
  color = "var(--accent)",
  track = "var(--panel-2)",
  children,
  glow = true,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  glow?: boolean;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ---------------------------------- chips ---------------------------------- */

export function Chip({
  children,
  color,
  icon,
  onClick,
  active,
  className,
  title,
}: {
  children: React.ReactNode;
  color?: string;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  title?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      title={title}
      className={cx("chip", onClick && "cursor-pointer hover:border-accent/60", className)}
      style={
        color
          ? { color, borderColor: `${color}55`, background: `${color}14` }
          : active
            ? { color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-soft)" }
            : undefined
      }
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </Tag>
  );
}

export function DiffBadge({ d, small }: { d: "Easy" | "Medium" | "Hard"; small?: boolean }) {
  const color = d === "Easy" ? "var(--easy)" : d === "Medium" ? "var(--medium)" : "var(--hard)";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full font-semibold",
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
      )}
      style={{ color, background: `${color}1c`, border: `1px solid ${color}44` }}
    >
      {small ? d[0] : d}
    </span>
  );
}

/* ---------------------------------- stats ---------------------------------- */

export function CountUp({ to, duration = 700, decimals = 0 }: { to: number; duration?: number; decimals?: number }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = to;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{v.toFixed(decimals)}</>;
}

export function Stat({
  label,
  value,
  sub,
  icon,
  color = "var(--accent)",
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cx("panel panel-hover p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</div>
        {icon && (
          <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${color}1c`, color }}>
            <Icon name={icon} size={14} />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight" style={{ color }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-dim">{sub}</div>}
    </div>
  );
}

/* --------------------------------- sparkline -------------------------------- */

export function Sparkline({
  data,
  width = 120,
  height = 34,
  color = "var(--accent)",
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  const path = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return { line, area: `${line} L${width},${height} L0,${height} Z` };
  }, [data, width, height]);

  if (!path.line) return <div style={{ width, height }} className="rounded bg-panel-2" />;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={path.area} fill={`url(#${id})`} />}
      <motion.path
        d={path.line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ---------------------------------- modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={cx("panel relative w-full overflow-hidden shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            style={{ background: "var(--bg-elev)" }}
          >
            {title && (
              <div className="hairline flex items-center justify-between px-5 py-3">
                <h3 className="font-semibold">{title}</h3>
                <button onClick={onClose} className="btn-ghost btn !px-2 !py-1">
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- tooltip --------------------------------- */

export function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-lg border border-line px-2.5 py-1.5 text-xs leading-snug shadow-xl"
            style={{ background: "var(--bg-elev)" }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* --------------------------------- sections -------------------------------- */

export function SectionTitle({
  title,
  sub,
  icon,
  right,
}: {
  title: string;
  sub?: string;
  icon?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {icon && <Icon name={icon} size={17} className="text-accent" />}
          {title}
        </h2>
        {sub && <p className="mt-0.5 max-w-2xl text-sm text-dim">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ icon = "Binoculars", title, body }: { icon?: string; title: string; body?: string }) {
  return (
    <div className="panel grid place-items-center gap-2 p-10 text-center">
      <Icon name={icon} size={26} className="text-faint" />
      <div className="font-semibold">{title}</div>
      {body && <div className="max-w-sm text-sm text-dim">{body}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-panel-2 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              "relative flex items-center gap-1.5 rounded-[10px] font-semibold transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              active ? "text-white" : "text-dim hover:text-text",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.map((x) => x.value).join("")}`}
                className="absolute inset-0 rounded-[10px] grad-bg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.icon && <Icon name={o.icon} size={12} />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
