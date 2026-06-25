// ─────────────────────────────────────────────────────────────────────────────
// OverviewTab — spend hero, category donut + legend, per-person net positions.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { Category, Currency, Expense, Participant, Payment } from '../types';
import type { Money } from '../lib/currency';
import { computeBalances } from '../lib/balances';
import { mono } from '../styles/ui';

interface OverviewTabProps {
  expenses: Expense[];
  payments: Payment[];
  participants: Participant[];
  categories: Category[];
  currencies: Currency[];
  tripBudgetUSD: number;
  money: Money;
}

export function OverviewTab({
  expenses,
  payments,
  participants,
  categories,
  currencies,
  tripBudgetUSD,
  money,
}: OverviewTabProps) {
  const vm = useMemo(() => {
    const expUSD = (e: Expense) => money.toUSD(e.amount, e.currency);
    const totalSpentUSD = expenses.reduce((a, e) => a + expUSD(e), 0);
    const remainingUSD = tripBudgetUSD - totalSpentUSD;
    const spentPct = tripBudgetUSD > 0 ? Math.min(100, Math.max(0, (totalSpentUSD / tripBudgetUSD) * 100)) : 0;

    // category breakdown
    const byCat: Record<string, number> = {};
    expenses.forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + expUSD(e);
    });
    const legend = categories
      .filter((c) => byCat[c.id])
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        amount: byCat[c.id],
        amountLabel: money.fmt(byCat[c.id]),
        pctLabel: (totalSpentUSD > 0 ? Math.round((byCat[c.id] / totalSpentUSD) * 100) : 0) + '%',
      }))
      .sort((a, b) => b.amount - a.amount);

    // donut segments (stroke-dasharray on a r=15.9155 circle == percent)
    let acc = 0;
    const donutSegments = legend.map((c) => {
      const pct = totalSpentUSD > 0 ? Math.max(0, (c.amount / totalSpentUSD) * 100) : 0;
      const seg = {
        color: c.color,
        dash: `${pct.toFixed(2)} ${(100 - pct).toFixed(2)}`,
        offset: (-acc).toFixed(2),
      };
      acc += pct;
      return seg;
    });

    // per person net
    const bal = computeBalances(participants, expenses, payments, currencies);
    const paidMap: Record<string, number> = {};
    participants.forEach((p) => (paidMap[p.id] = 0));
    expenses.forEach((e) => (paidMap[e.paidBy] += expUSD(e)));

    const perPerson = participants.map((p) => {
      const net = Math.round(bal[p.id] * 100) / 100;
      const settled = Math.abs(net) < 0.5;
      const netColor = settled ? '#9a9488' : net > 0 ? '#3a7a4a' : '#c06a5e';
      return {
        id: p.id,
        name: p.full,
        initials: p.initials,
        color: p.color,
        paidLabel: money.fmt(paidMap[p.id]),
        netLabel: settled ? money.fmt(0) : money.fmt(Math.abs(net)),
        netWord: settled ? 'settled' : net > 0 ? 'gets back' : 'owes',
        netColor,
      };
    });

    return {
      totalSpentLabel: money.fmt(totalSpentUSD),
      budgetLabel: money.fmt(tripBudgetUSD),
      remainingWord: remainingUSD >= 0 ? 'Left' : 'Over',
      remainingLabel: money.fmt(Math.abs(remainingUSD)),
      remainingColor: remainingUSD >= 0 ? '#cde0c4' : '#e8b4a8',
      spentPct: spentPct.toFixed(1),
      spentPctLabel: Math.round(spentPct) + '%',
      expenseCount: expenses.length,
      donutSegments,
      legend,
      topCategoryName: legend[0] ? legend[0].name : '—',
      perPerson,
    };
  }, [expenses, payments, participants, categories, currencies, tripBudgetUSD, money]);

  return (
    <div>
      {/* HERO */}
      <div
        style={{
          background: 'linear-gradient(158deg,#3f6147 0%,#33503a 60%,#2c4633 100%)',
          borderRadius: 28,
          padding: '22px 22px 20px',
          color: '#fff',
          boxShadow: '0 18px 36px -16px rgba(47,74,53,.7)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={mono(10, '.16em', '#a9c1a6')}>Total Spent</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
              {vm.totalSpentLabel}
            </div>
            <div style={{ fontSize: 12, color: '#b9ccb6', fontWeight: 600, marginTop: 2 }}>of {vm.budgetLabel} budget</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={mono(10, '.12em', '#a9c1a6')}>{vm.remainingWord}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, fontVariantNumeric: 'tabular-nums', color: vm.remainingColor }}>
              {vm.remainingLabel}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, height: 9, background: 'rgba(255,255,255,.14)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: '100%', width: `${vm.spentPct}%`, background: 'linear-gradient(90deg,#a9c1a6,#cdb87a)', borderRadius: 6, transition: 'width .5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 10.5, fontWeight: 600, color: '#b9ccb6', fontVariantNumeric: 'tabular-nums' }}>
          <span>{vm.spentPctLabel} used</span>
          <span>{vm.expenseCount} expenses · {money.code}</span>
        </div>
      </div>

      {/* DONUT + LEGEND */}
      <div style={{ background: '#fff', border: '1px solid #ece7db', borderRadius: 24, padding: 20, marginTop: 14, boxShadow: '0 4px 14px -8px rgba(60,70,55,.2)' }}>
        <div style={{ ...mono(10, '.16em'), marginBottom: 14 }}>By Category</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 118, height: 118, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" width="118" height="118">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f0ece2" strokeWidth="3.6" />
              <g transform="rotate(-90 18 18)">
                {vm.donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="3.6"
                    strokeDasharray={seg.dash}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: '#9a9488', letterSpacing: '.08em', textTransform: 'uppercase' }}>Top</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2c352c', lineHeight: 1, marginTop: 2, textAlign: 'center', maxWidth: 74 }}>{vm.topCategoryName}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {vm.legend.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0, background: cat.color }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, color: '#52564c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#2c352c', fontVariantNumeric: 'tabular-nums' }}>{cat.amountLabel}</span>
                <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: '#a39d90', minWidth: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{cat.pctLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PER PERSON */}
      <div style={{ marginTop: 14 }}>
        <div style={{ ...mono(10, '.16em'), margin: '4px 4px 10px' }}>Per Person</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vm.perPerson.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #ece7db', borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px -6px rgba(60,70,55,.2)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, background: p.color }}>{p.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2c352c' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#9a9488', fontWeight: 600 }}>paid {p.paidLabel}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: p.netColor }}>{p.netLabel}</div>
                <div style={{ ...mono(8.5, '.1em', p.netColor), opacity: 0.8 }}>{p.netWord}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
