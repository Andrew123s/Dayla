// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
//
// The prototype ships custom hand-drawn glyphs (the category icons especially
// aren't standard Lucide shapes), so we keep the exact `path` data rather than
// swapping in an icon library. If you'd prefer Lucide React (per Dayla's stack),
// these are 1:1 replaceable — but the look will shift slightly.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

/** Renders an arbitrary category glyph from its raw path `d`. */
export function CategoryIcon({ d, size = 19, color = '#000', strokeWidth = 2 }: { d: string; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function ChevronDown({ size = 10, color = '#3a5a40', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={style} fill="none" stroke={color} strokeWidth={2}>
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

export function Plus({ size = 19, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Receipt({ size = 13, color = '#a39d90', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

export function Pencil({ size = 14, color = '#7a7468' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function Trash({ size = 14, color = '#c06a5e' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  );
}

export function ArrowRight({ size = 20, color = '#c4bdac', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckCircle({ size = 17, color = '#6f9a72', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5 11 15l4.5-5" />
    </svg>
  );
}

export function CheckBig({ size = 24, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Close({ size = 16, color = '#6a6458' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Pin({ size = 15, color = '#a39d90', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

/** The recycling/repay glyph used on the Settle "Outstanding" card. */
export function Repay({ size = 22, color = '#3a5a40' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6M12 3v3M12 18v3" />
    </svg>
  );
}

/** Status-bar cellular signal bars. */
export function SignalBars() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="#2a2a26">
      <rect x="0" y="6" width="3" height="5" rx="1" />
      <rect x="4.5" y="3.5" width="3" height="7.5" rx="1" />
      <rect x="9" y="1" width="3" height="10" rx="1" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" opacity=".35" />
    </svg>
  );
}

/** Status-bar battery glyph. */
export function Battery() {
  return (
    <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
      <rect x="0.5" y="0.5" width="18" height="10" rx="3" stroke="#2a2a26" opacity=".4" />
      <rect x="2" y="2" width="13" height="7" rx="1.5" fill="#2a2a26" />
      <rect x="19.5" y="3.5" width="1.5" height="4" rx="1" fill="#2a2a26" opacity=".5" />
    </svg>
  );
}
