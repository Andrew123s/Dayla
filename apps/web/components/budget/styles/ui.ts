// ─────────────────────────────────────────────────────────────────────────────
// Shared style fragments
//
// The prototype is styled with inline styles to keep the design pixel-faithful.
// These helpers capture the handful of style patterns that repeat a lot (the
// Space Mono uppercase labels, the white card) so components stay readable.
// Everything else is inlined at the point of use.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';

export const FONT_SANS = "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif";
export const FONT_MONO = "'Space Mono', monospace";

/** Core palette pulled from the original design. */
export const colors = {
  paper: '#f4f1ea',
  ink: '#2c352c',
  green: '#3a5a40',
  greenDeep: '#33503a',
  sage: '#a9c1a6',
  gold: '#cdb87a',
  mute: '#9a9488',
  muteSoft: '#a39d90',
  line: '#ece7db',
  lineSoft: '#e6e1d6',
  danger: '#c06a5e',
} as const;

/** Space Mono uppercase micro-label. */
export function mono(size = 10, letterSpacing = '.16em', color: string = colors.mute): CSSProperties {
  return {
    fontFamily: FONT_MONO,
    fontSize: size,
    letterSpacing,
    textTransform: 'uppercase',
    color,
    fontWeight: 700,
  };
}

/** White rounded surface used for the donut card, list rows, etc. */
export function card(radius = 18): CSSProperties {
  return {
    background: '#fff',
    border: `1px solid ${colors.line}`,
    borderRadius: radius,
    boxShadow: '0 2px 8px -6px rgba(60,70,55,.2)',
  };
}
