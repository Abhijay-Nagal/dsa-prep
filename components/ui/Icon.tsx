"use client";

import {
  Activity, AlertTriangle, ArrowDownWideNarrow, ArrowLeft, ArrowRight, ArrowUpDown, Award,
  BadgeCheck, BarChart3, Binary, Binoculars, Blocks, BookOpen, Bookmark, BookmarkCheck, Bolt,
  Boxes, Braces, Brain, Building2, CalendarCheck, Calculator, Check, CheckCheck, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, CircleDot, Clock, Code2, Command,
  Compass, Copy, Cpu, Crosshair, Crown, Dices, Download, ExternalLink, Eye, EyeOff, FastForward,
  Filter, Flag, Flame, Gamepad2, Gauge, Gem, GitBranch, GitCommitHorizontal, GitFork, Globe,
  GraduationCap, Grid3x3, Hash, Hourglass, Infinity as InfinityIcon, Info, Joystick, Keyboard,
  LayoutDashboard, Layers, Layers3, Lightbulb, Link2, ListChecks, ListOrdered, Loader2, Lock, Map,
  Maximize2, Medal, Menu, Minimize2, Minus, Moon, MoonStar, Mountain, MoveHorizontal, Network,
  PanelLeft, PanelLeftClose, Pause, Play, PlayCircle, Plus, Projector, RectangleHorizontal,
  RefreshCw, Repeat, Rewind, RotateCcw, Rocket, Search, Settings, Share2, ShieldCheck, Shuffle,
  Sigma, SkipBack, SkipForward, Skull, Sliders, Sparkle, Sparkles, Star, StickyNote, Sun, Sunrise,
  Swords, Target, TextSearch, Timer, TrendingUp, Triangle, Trophy, Trash2, Type, Undo2, Unlock,
  Upload, User, Wand2, X, Zap, Rows3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Activity, AlertTriangle, ArrowDownWideNarrow, ArrowLeft, ArrowRight, ArrowUpDown, Award,
  BadgeCheck, BarChart3, Binary, Binoculars, Blocks, BookOpen, Bookmark, BookmarkCheck, Bolt,
  Boxes, Braces, Brain, Building2, CalendarCheck, Calculator, Check, CheckCheck, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, CircleDot, Clock, Code2, Command,
  Compass, Copy, Cpu, Crosshair, Crown, Dices, Download, ExternalLink, Eye, EyeOff, FastForward,
  Filter, Flag, Flame, Gamepad2, Gauge, Gem, GitBranch, GitCommitHorizontal, GitFork, Globe,
  GraduationCap, Grid3x3, Hash, Hourglass, Infinity: InfinityIcon, Info, Joystick, Keyboard,
  LayoutDashboard, Layers, Layers3, Lightbulb, Link2, ListChecks, ListOrdered, Loader2, Lock, Map,
  Maximize2, Medal, Menu, Minimize2, Minus, Moon, MoonStar, Mountain, MoveHorizontal, Network,
  PanelLeft, PanelLeftClose, Pause, Play, PlayCircle, Plus, Projector, RectangleHorizontal,
  RefreshCw, Repeat, Rewind, RotateCcw, Rocket, Search, Settings, Share2, ShieldCheck, Shuffle,
  Sigma, SkipBack, SkipForward, Skull, Sliders, Sparkle, Sparkles, Star, StickyNote, Sun, Sunrise,
  Swords, Target, TextSearch, Timer, TrendingUp, Triangle, Trophy, Trash2, Type, Undo2, Unlock,
  Upload, User, Wand2, X, Zap, Rows3,
};

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 2,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const Cmp = MAP[name] ?? CircleDot;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}

export const hasIcon = (name: string) => name in MAP;
