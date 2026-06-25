// ─────────────────────────────────────────────────────────────────────────────
// Split computation for the add/edit form (pure)
//
// Given the draft form, produce the concrete per-participant split amounts in
// the expense's *native* currency:
//   • equal   — even split, with any rounding remainder folded into the first
//   • percent — each participant's percent of the amount
//   • custom  — each participant's typed amount
// ─────────────────────────────────────────────────────────────────────────────

import type { ExpenseForm, Split } from '../types';

export function computeFormSplits(form: ExpenseForm): Split[] {
  const amt = Number(form.amount) || 0;
  const ids = form.splitters;
  if (ids.length === 0) return [];

  if (form.splitMethod === 'equal') {
    const per = Math.floor((amt / ids.length) * 100) / 100;
    const splits = ids.map((pid) => ({ pid, amount: per }));
    const rem = Math.round((amt - per * ids.length) * 100) / 100;
    if (splits.length && Math.abs(rem) >= 0.01) {
      splits[0].amount = Math.round((splits[0].amount + rem) * 100) / 100;
    }
    return splits;
  }

  if (form.splitMethod === 'percent') {
    return ids.map((pid) => ({
      pid,
      amount: Math.round(amt * ((Number(form.percents[pid]) || 0) / 100) * 100) / 100,
    }));
  }

  // custom
  return ids.map((pid) => ({ pid, amount: Number(form.customs[pid]) || 0 }));
}
