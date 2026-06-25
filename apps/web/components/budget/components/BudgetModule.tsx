// ─────────────────────────────────────────────────────────────────────────────
// BudgetModule — the integrable Budget feature.
//
// Drop this into Dayla anywhere you have a sized, positioned container (it fills
// its parent absolutely, like a screen). All data is optional and defaults to
// the demo seed; pass real trip data + change handlers to wire it to your API.
//
//   <div style={{ position:'relative', width:393, height:852 }}>
//     <BudgetModule
//       title="Berlin '26 · 4 of us"
//       participants={tripMembers}
//       initialExpenses={trip.expenses}
//       tripBudgetUSD={trip.budgetUSD}
//       onExpensesChange={persistExpenses}
//     />
//   </div>
// ─────────────────────────────────────────────────────────────────────────────

import { useBudget, type UseBudgetOptions } from '../hooks/useBudget';
import { FONT_SANS } from '../styles/ui';
import { BudgetHeader } from './BudgetHeader';
import { OverviewTab } from './OverviewTab';
import { ActivityTab } from './ActivityTab';
import { SettleTab } from './SettleTab';
import { ExpenseSheet } from './ExpenseSheet';
import { Plus } from './icons';

export interface BudgetModuleProps extends UseBudgetOptions {
  /** Small uppercase label above the title (e.g. "Trip Budget"). */
  eyebrow: string;
  /** Main trip heading (from the real trip — never hardcoded). */
  title: string;
}

export function BudgetModule({ eyebrow, title, ...options }: BudgetModuleProps) {
  const c = useBudget(options);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f4f1ea', overflow: 'hidden', fontFamily: FONT_SANS }}>
      <BudgetHeader
        eyebrow={eyebrow}
        title={title}
        currencies={c.currencies}
        displayCurrency={c.displayCurrency}
        onCurrencyChange={c.setDisplayCurrency}
        tab={c.tab}
        onTabChange={c.setTab}
      />

      {/* scroll content (top padding clears the absolute header) */}
      <div className="bud-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '178px 20px 120px' }}>
        {c.tab === 'overview' && (
          <OverviewTab
            expenses={c.expenses}
            payments={c.payments}
            participants={c.participants}
            categories={c.categories}
            currencies={c.currencies}
            tripBudgetUSD={c.tripBudgetUSD}
            money={c.money}
          />
        )}

        {c.tab === 'transactions' && (
          <ActivityTab
            expenses={c.expenses}
            participants={c.participants}
            categories={c.categories}
            money={c.money}
            fCat={c.fCat}
            fPerson={c.fPerson}
            canEdit={c.canEdit}
            onFilterCat={c.setFCat}
            onFilterPerson={c.setFPerson}
            onEdit={c.editExpense}
            onDelete={c.deleteExpense}
            onToggleSettled={c.toggleSettled}
          />
        )}

        {c.tab === 'settle' && (
          <SettleTab
            expenses={c.expenses}
            payments={c.payments}
            participants={c.participants}
            currencies={c.currencies}
            money={c.money}
            settleView={c.settleView}
            canEdit={c.canEdit}
            onSettleViewChange={c.setSettleView}
            onSettleUp={c.settleUp}
            onUndoPayment={c.undoPayment}
          />
        )}
      </div>

      {/* FAB */}
      {c.canEdit && !c.showAdd && (
        <button
          onClick={c.openAdd}
          style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#3a5a40', color: '#fff', border: 'none', borderRadius: 18, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 14px 28px -10px rgba(58,90,64,.75)' }}
        >
          <Plus />
          Add Expense
        </button>
      )}

      {/* add / edit sheet */}
      {c.showAdd && <ExpenseSheet c={c} />}
    </div>
  );
}
