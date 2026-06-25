// ─────────────────────────────────────────────────────────────────────────────
// ActivityTab — category & person filter chips + the filtered expense list.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { Category, Expense, Participant } from '../types';
import type { Money } from '../lib/currency';
import { pillStyle } from '../styles/buttons';
import { CategoryIcon, Pencil, Receipt, Trash } from './icons';

interface ActivityTabProps {
  expenses: Expense[];
  participants: Participant[];
  categories: Category[];
  money: Money;
  fCat: string;
  fPerson: string;
  canEdit: boolean;
  onFilterCat: (id: string) => void;
  onFilterPerson: (id: string) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  onToggleSettled: (id: string) => void;
}

export function ActivityTab({
  expenses,
  participants,
  categories,
  money,
  fCat,
  fPerson,
  canEdit,
  onFilterCat,
  onFilterPerson,
  onEdit,
  onDelete,
  onToggleSettled,
}: ActivityTabProps) {
  const pOf = (id: string) => participants.find((p) => p.id === id) || participants[0];

  const { filtered, filteredTotalLabel, filteredCount } = useMemo(() => {
    const expUSD = (e: Expense) => money.toUSD(e.amount, e.currency);
    let list = expenses.slice();
    if (fCat !== 'all') list = list.filter((e) => e.category === fCat);
    if (fPerson !== 'all') {
      list = list.filter((e) => e.paidBy === fPerson || e.splits.some((s) => s.pid === fPerson));
    }
    list.sort((a, b) => (a.date < b.date ? 1 : -1));
    const totalUSD = list.reduce((a, e) => a + expUSD(e), 0);
    return { filtered: list, filteredTotalLabel: money.fmt(totalUSD), filteredCount: list.length };
  }, [expenses, fCat, fPerson, money]);

  const catFilters = [{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.id, label: c.short }))];
  const personFilters = [{ id: 'all', label: 'Everyone' }, ...participants.map((p) => ({ id: p.id, label: p.name }))];

  const renderRow = (e: Expense) => {
    const cat = categories.find((c) => c.id === e.category) || categories[categories.length - 1];
    const payer = pOf(e.paidBy);
    const dateLabel = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const meta = [dateLabel, 'paid by ' + payer.name, e.location].filter(Boolean).join(' · ');
    const usd = money.toUSD(e.amount, e.currency);
    const showOrig = e.currency !== money.code;
    const methodWord = e.splitMethod === 'equal' ? 'split equally' : e.splitMethod === 'percent' ? 'split by %' : 'custom split';

    return (
      <div key={e.id} style={{ background: '#fff', border: '1px solid #ece7db', borderRadius: 18, padding: '12px 13px', boxShadow: '0 2px 8px -6px rgba(60,70,55,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cat.color + '22' }}>
            <CategoryIcon d={cat.icon} size={19} color={cat.color} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2c352c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>
              {e.receiptUrl && (
                <a
                  href={e.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View receipt"
                  onClick={(ev) => ev.stopPropagation()}
                  style={{ flexShrink: 0, display: 'inline-flex', lineHeight: 0 }}
                >
                  <Receipt style={{ flexShrink: 0 }} />
                </a>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#9a9488', fontWeight: 600, marginTop: 1 }}>{meta}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2c352c', fontVariantNumeric: 'tabular-nums' }}>{money.fmt(usd)}</div>
            <div style={{ fontSize: 10, color: '#a39d90', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{showOrig ? money.fmtCur(e.amount, e.currency) : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 10, borderTop: '1px solid #f2eee4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 7, background: e.settled ? '#e6efe2' : '#f3ede2', color: e.settled ? '#4a7a52' : '#a8915a' }}>
              {e.settled ? 'Settled' : 'Open'}
            </span>
            <span style={{ fontSize: 10.5, color: '#a39d90', fontWeight: 600 }}>{e.splits.length} people · {methodWord}</span>
          </div>
          {canEdit && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onToggleSettled(e.id)} style={{ fontSize: 10, fontWeight: 700, color: '#3a5a40', background: '#eef1e6', border: 'none', borderRadius: 9, padding: '5px 10px', cursor: 'pointer' }}>
                {e.settled ? 'Reopen' : 'Mark paid'}
              </button>
              <button onClick={() => onEdit(e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: '#f3efe6', border: 'none', borderRadius: 9, cursor: 'pointer' }}>
                <Pencil />
              </button>
              <button onClick={() => onDelete(e.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: '#f7ebe9', border: 'none', borderRadius: 9, cursor: 'pointer' }}>
                <Trash />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* category filters */}
      <div className="bud-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 2px 10px' }}>
        {catFilters.map((f) => {
          const c = pillStyle(fCat === f.id);
          return (
            <button key={f.id} onClick={() => onFilterCat(f.id)} style={chipStyle(c)}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* person filters */}
      <div className="bud-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 2px 12px' }}>
        {personFilters.map((f) => {
          const c = pillStyle(fPerson === f.id);
          return (
            <button key={f.id} onClick={() => onFilterPerson(f.id)} style={chipStyle(c)}>
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 4px 10px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9a9488', fontVariantNumeric: 'tabular-nums' }}>
          {filteredCount} shown · {filteredTotalLabel}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(renderRow)}
        {filtered.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #ddd6c8', borderRadius: 18, padding: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7a7468' }}>
              {expenses.length === 0 ? 'No expenses yet' : 'No expenses match'}
            </div>
            <div style={{ fontSize: 11, color: '#a39d90', marginTop: 3 }}>
              {expenses.length === 0 ? 'Add your first expense to get started.' : 'Try clearing a filter.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function chipStyle(c: { bg: string; fg: string; bd: string }) {
  return {
    borderRadius: 11,
    padding: '7px 13px',
    fontSize: 11.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    transition: 'all .15s',
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.bd}`,
  };
}
