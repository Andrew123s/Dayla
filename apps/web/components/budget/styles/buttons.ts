// ─────────────────────────────────────────────────────────────────────────────
// Toggle-button style states
//
// Three families of selectable controls share these active/inactive styles:
//   • tabStyle  — the top Overview / Activity / Settle tab bar
//   • segStyle  — pill segmented controls (Equal/Percent/Custom, Simplified/Every)
//   • pillStyle — the scrollable filter chips on the Activity tab
// ─────────────────────────────────────────────────────────────────────────────

export function tabStyle(active: boolean) {
  return active
    ? { bg: '#fff', fg: '#3a5a40', sh: '0 2px 6px -2px rgba(0,0,0,.12)' }
    : { bg: 'transparent', fg: '#8a8479', sh: 'none' };
}

export function segStyle(active: boolean) {
  return active ? { bg: '#3a5a40', fg: '#fff' } : { bg: 'transparent', fg: '#7a8470' };
}

export function pillStyle(active: boolean) {
  return active
    ? { bg: '#3a5a40', fg: '#fff', bd: 'transparent' }
    : { bg: '#fff', fg: '#7a7468', bd: '#e6e1d6' };
}
