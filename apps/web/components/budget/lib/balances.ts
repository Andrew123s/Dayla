// ─────────────────────────────────────────────────────────────────────────────
// Balance & settlement math (pure)
//
// `computeBalances` produces each participant's net position in USD:
//   positive  → they are owed money (paid more than their share)
//   negative  → they owe money
//
// Two settlement strategies are offered:
//   • minimizedTransfers — greedy debt simplification (fewest payments)
//   • pairwiseTransfers  — every direct debt between two people, netted
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency, Expense, Participant, Payment, Transfer } from '../types';
import { toUSD } from './currency';

/** Net USD balance per participant id. */
export function computeBalances(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  currencies: Currency[],
): Record<string, number> {
  const bal: Record<string, number> = {};
  participants.forEach((p) => {
    bal[p.id] = 0;
  });

  expenses.forEach((e) => {
    bal[e.paidBy] += toUSD(currencies, e.amount, e.currency);
    e.splits.forEach((s) => {
      bal[s.pid] -= toUSD(currencies, s.amount, e.currency);
    });
  });

  payments.forEach((pm) => {
    bal[pm.from] += pm.amountUSD;
    bal[pm.to] -= pm.amountUSD;
  });

  return bal;
}

/** Greedy "fewest transfers" settlement: roll debtors into creditors. */
export function minimizedTransfers(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  currencies: Currency[],
): Transfer[] {
  const bal = computeBalances(participants, expenses, payments, currencies);
  const debt: { id: string; amt: number }[] = [];
  const cred: { id: string; amt: number }[] = [];

  participants.forEach((p) => {
    const v = Math.round(bal[p.id] * 100) / 100;
    if (v < -0.5) debt.push({ id: p.id, amt: -v });
    else if (v > 0.5) cred.push({ id: p.id, amt: v });
  });

  debt.sort((a, b) => b.amt - a.amt);
  cred.sort((a, b) => b.amt - a.amt);

  const out: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debt.length && j < cred.length) {
    const amt = Math.min(debt[i].amt, cred[j].amt);
    out.push({ from: debt[i].id, to: cred[j].id, amountUSD: amt });
    debt[i].amt -= amt;
    cred[j].amt -= amt;
    if (debt[i].amt < 0.5) i++;
    if (cred[j].amt < 0.5) j++;
  }
  return out;
}

/** Every direct debt between two people, netted to a single direction. */
export function pairwiseTransfers(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  currencies: Currency[],
): Transfer[] {
  const m: Record<string, Record<string, number>> = {};
  participants.forEach((a) => {
    m[a.id] = {};
    participants.forEach((b) => {
      m[a.id][b.id] = 0;
    });
  });

  expenses.forEach((e) => {
    e.splits.forEach((s) => {
      if (s.pid !== e.paidBy) m[s.pid][e.paidBy] += toUSD(currencies, s.amount, e.currency);
    });
  });
  payments.forEach((pm) => {
    m[pm.from][pm.to] -= pm.amountUSD;
  });

  const out: Transfer[] = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const a = participants[i].id;
      const b = participants[j].id;
      const net = m[a][b] - m[b][a];
      if (net > 0.5) out.push({ from: a, to: b, amountUSD: net });
      else if (net < -0.5) out.push({ from: b, to: a, amountUSD: -net });
    }
  }
  return out;
}
