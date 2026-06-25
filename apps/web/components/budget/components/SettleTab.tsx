// ─────────────────────────────────────────────────────────────────────────────
// SettleTab — outstanding total, minimized/pairwise transfer suggestions,
// and the log of recorded settlements (with undo).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { Currency, Expense, Participant, Payment, SettleView } from '../types';
import type { Money } from '../lib/currency';
import { minimizedTransfers, pairwiseTransfers } from '../lib/balances';
import { mono } from '../styles/ui';
import { segStyle } from '../styles/buttons';
import { ArrowRight, CheckBig, CheckCircle, Repay } from './icons';

interface SettleTabProps {
  expenses: Expense[];
  payments: Payment[];
  participants: Participant[];
  currencies: Currency[];
  money: Money;
  settleView: SettleView;
  canEdit: boolean;
  onSettleViewChange: (v: SettleView) => void;
  onSettleUp: (from: string, to: string, amountUSD: number) => void;
  onUndoPayment: (id: string) => void;
}

export function SettleTab({
  expenses,
  payments,
  participants,
  currencies,
  money,
  settleView,
  canEdit,
  onSettleViewChange,
  onSettleUp,
  onUndoPayment,
}: SettleTabProps) {
  const pOf = (id: string) => participants.find((p) => p.id === id) || participants[0];

  const { settleList, outstandingLabel, settledLog } = useMemo(() => {
    const raw =
      settleView === 'minimized'
        ? minimizedTransfers(participants, expenses, payments, currencies)
        : pairwiseTransfers(participants, expenses, payments, currencies);
    const outstandingUSD = raw.reduce((a, t) => a + t.amountUSD, 0);

    const list = raw.map((t, i) => {
      const from = pOf(t.from);
      const to = pOf(t.to);
      return {
        key: `${t.from}-${t.to}-${i}`,
        fromInitials: from.initials,
        fromColor: from.color,
        toInitials: to.initials,
        toColor: to.color,
        label: `${from.name} → ${to.name}`,
        amountLabel: money.fmt(t.amountUSD),
        onSettle: () => onSettleUp(t.from, t.to, t.amountUSD),
      };
    });

    const log = payments.map((pm) => {
      const from = pOf(pm.from);
      const to = pOf(pm.to);
      return {
        id: pm.id,
        label: `${from.name} paid ${to.name}`,
        amountLabel: money.fmt(pm.amountUSD),
      };
    });

    return { settleList: list, outstandingLabel: money.fmt(outstandingUSD), settledLog: log };
  }, [expenses, payments, participants, currencies, money, settleView]);

  const segMin = segStyle(settleView === 'minimized');
  const segPair = segStyle(settleView === 'pairwise');

  return (
    <div>
      {/* outstanding card */}
      <div style={{ background: '#fff', border: '1px solid #ece7db', borderRadius: 22, padding: '16px 18px', boxShadow: '0 4px 14px -8px rgba(60,70,55,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={mono(10, '.14em')}>Outstanding</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#2c352c', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{outstandingLabel}</div>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: '#eef1e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Repay />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 14, background: '#eef0e8', padding: 4, borderRadius: 13 }}>
          <button onClick={() => onSettleViewChange('minimized')} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: segMin.bg, color: segMin.fg }}>
            Simplified
          </button>
          <button onClick={() => onSettleViewChange('pairwise')} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: segPair.bg, color: segPair.fg }}>
            Every debt
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: '#a39d90', fontWeight: 600, marginTop: 9, lineHeight: 1.4 }}>
          {settleView === 'minimized'
            ? 'Fewest transfers to get everyone even — debts are rolled up.'
            : 'Every direct debt between two people, shown separately.'}
        </div>
      </div>

      <div style={{ ...mono(10, '.14em'), margin: '18px 4px 10px' }}>Suggested Transfers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {settleList.map((s) => (
          <div key={s.key} style={{ background: '#fff', border: '1px solid #ece7db', borderRadius: 18, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 2px 8px -6px rgba(60,70,55,.2)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, background: s.fromColor }}>{s.fromInitials}</div>
            <ArrowRight style={{ flexShrink: 0 }} />
            <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, background: s.toColor }}>{s.toInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2c352c' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#9a9488', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.amountLabel}</div>
            </div>
            {canEdit && (
              <button onClick={s.onSettle} style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#3a5a40', border: 'none', borderRadius: 11, padding: '8px 13px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 8px -3px rgba(58,90,64,.6)' }}>
                Settle
              </button>
            )}
          </div>
        ))}

        {settleList.length === 0 && (
          <div style={{ background: 'linear-gradient(150deg,#eef3e8,#e7efe2)', border: '1px solid #d7e3cf', borderRadius: 18, padding: 26, textAlign: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#3a5a40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <CheckBig />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#2c352c' }}>All settled up</div>
            <div style={{ fontSize: 11.5, color: '#7a8470', marginTop: 3 }}>Everyone's even. Nice trip.</div>
          </div>
        )}
      </div>

      {settledLog.length > 0 && (
        <div>
          <div style={{ ...mono(10, '.14em'), margin: '20px 4px 10px' }}>Settled</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {settledLog.map((s) => (
              <div key={s.id} style={{ background: '#f2efe7', border: '1px solid #e8e3d6', borderRadius: 15, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: '#6a7363' }}>{s.label}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#5d6a56', fontVariantNumeric: 'tabular-nums' }}>{s.amountLabel}</span>
                {canEdit && (
                  <button onClick={() => onUndoPayment(s.id)} style={{ fontSize: 10, fontWeight: 700, color: '#a39d90', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    undo
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
