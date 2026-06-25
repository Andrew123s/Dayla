// ─────────────────────────────────────────────────────────────────────────────
// Public surface of the Budget module.
// Import what you need from here when integrating into Dayla.
// ─────────────────────────────────────────────────────────────────────────────

export { BudgetModule } from './components/BudgetModule';
export type { BudgetModuleProps } from './components/BudgetModule';

// Hook + controller type (use directly if you want a custom layout)
export { useBudget } from './hooks/useBudget';
export type { UseBudgetOptions, BudgetController, BudgetPersistence } from './hooks/useBudget';

// Pure logic (handy for tests / server-side reconciliation)
export { createMoney, curOf, toUSD, fromUSD, fmtNum } from './lib/currency';
export type { Money } from './lib/currency';
export { computeBalances, minimizedTransfers, pairwiseTransfers } from './lib/balances';
export { computeFormSplits } from './lib/splits';

// Structural defaults (category taxonomy + USD fallback)
export { CATEGORIES, FALLBACK_CURRENCIES } from './data/seed';

// Types
export type {
  Currency,
  CurrencyCode,
  Category,
  CategoryId,
  Participant,
  Split,
  SplitMethod,
  Expense,
  Payment,
  Transfer,
  Tab,
  SettleView,
  ExpenseForm,
} from './types';
