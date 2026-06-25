// ─────────────────────────────────────────────────────────────────────────────
// BudgetHeader — sticky header: trip title, display-currency picker, tab bar.
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency, CurrencyCode, Tab } from '../types';
import { FONT_MONO, mono } from '../styles/ui';
import { tabStyle } from '../styles/buttons';
import { ChevronDown } from './icons';

interface BudgetHeaderProps {
  eyebrow: string;
  title: string;
  currencies: Currency[];
  displayCurrency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Activity' },
  { id: 'settle', label: 'Settle' },
];

export function BudgetHeader({
  eyebrow,
  title,
  currencies,
  displayCurrency,
  onCurrencyChange,
  tab,
  onTabChange,
}: BudgetHeaderProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '54px 20px 14px',
        background: 'rgba(244,241,234,.86)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #e6e1d6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={mono(10, '.18em')}>{eyebrow}</div>
          <h1 style={{ margin: '3px 0 0', fontSize: 20, fontWeight: 800, color: '#36543e', letterSpacing: '-.02em', lineHeight: 1 }}>
            {title}
          </h1>
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={displayCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: '#fff',
              border: '1px solid #e3ddd0',
              borderRadius: 14,
              padding: '9px 30px 9px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#3a5a40',
              cursor: 'pointer',
              fontFamily: FONT_MONO,
              letterSpacing: '.04em',
              boxShadow: '0 1px 2px rgba(0,0,0,.04)',
            }}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.symbol}
              </option>
            ))}
          </select>
          <ChevronDown style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14, background: '#e9e4d8', padding: 4, borderRadius: 16 }}>
        {TABS.map((t) => {
          const s = tabStyle(tab === t.id);
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: 12,
                padding: '9px 0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .2s',
                background: s.bg,
                color: s.fg,
                boxShadow: s.sh,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
