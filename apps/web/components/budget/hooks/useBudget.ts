// ─────────────────────────────────────────────────────────────────────────────
// useBudget — all state + actions for the Budget module
//
// State lives here; pure derivations (balances, formatting, splits) live in
// ../lib and are called by the view components.
//
// When a `persistence` adapter is supplied (the real Dayla integration), every
// mutating action is applied optimistically to local state and then sent to the
// backend; on failure the optimistic change is rolled back and `onError` fires.
// New items adopt the server-returned document (and its `_id`). Without an
// adapter the hook simply mutates in-memory and notifies via `on*Change`.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Category,
  Currency,
  CurrencyCode,
  Expense,
  ExpenseForm,
  Participant,
  Payment,
  SettleView,
  Tab,
} from '../types';
import { createMoney, toUSD } from '../lib/currency';
import { CATEGORIES, FALLBACK_CURRENCIES } from '../data/seed';

/** The shape persisted for an expense (everything except its id). */
export type ExpenseInput = Omit<Expense, 'id'>;

/** Backend adapter — each method performs a real, persisted action. */
export interface BudgetPersistence {
  addExpense: (input: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, input: ExpenseInput) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  setSettled: (id: string, settled: boolean) => Promise<Expense>;
  addSettlement: (from: string, to: string, amountUSD: number) => Promise<Payment>;
  removeSettlement: (id: string) => Promise<void>;
}

export interface UseBudgetOptions {
  participants?: Participant[];
  categories?: Category[];
  currencies?: Currency[];
  tripBudgetUSD?: number;
  initialExpenses?: Expense[];
  initialPayments?: Payment[];
  initialCurrency?: CurrencyCode;
  /** Whether the current user may add/edit/delete/settle. */
  canEdit?: boolean;
  /** Backend adapter; when present, actions persist instead of staying local. */
  persistence?: BudgetPersistence;
  /** Upload a receipt file and resolve with its URL. */
  uploadReceipt?: (file: File) => Promise<string>;
  /** Surfaced for toast/error reporting on a failed mutation. */
  onError?: (message: string) => void;
  /** Legacy in-memory notifications (used only without a persistence adapter). */
  onExpensesChange?: (expenses: Expense[]) => void;
  onPaymentsChange?: (payments: Payment[]) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultPayer(participants: Participant[]): string {
  const me = participants.find((p) => p.you);
  return me?.id ?? participants[0]?.id ?? '';
}

function blankForm(currency: CurrencyCode, participants: Participant[]): ExpenseForm {
  return {
    title: '',
    amount: '',
    currency,
    category: 'food',
    description: '',
    date: today(),
    location: '',
    paidBy: defaultPayer(participants),
    splitters: participants.map((p) => p.id),
    splitMethod: 'equal',
    percents: {},
    customs: {},
    receiptUrl: null,
  };
}

export function useBudget(options: UseBudgetOptions = {}) {
  const participants = options.participants ?? [];
  const categories = options.categories ?? CATEGORIES;
  const currencies = options.currencies && options.currencies.length ? options.currencies : FALLBACK_CURRENCIES;
  const tripBudgetUSD = options.tripBudgetUSD ?? 0;
  const canEdit = options.canEdit ?? true;
  const { onExpensesChange, onPaymentsChange, persistence, uploadReceipt, onError } = options;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('overview');
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(options.initialCurrency ?? 'USD');
  const [fCat, setFCat] = useState<string>('all');
  const [fPerson, setFPerson] = useState<string>('all');
  const [settleView, setSettleView] = useState<SettleView>('minimized');

  // ── sheet / form state ──────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(() =>
    blankForm(options.initialCurrency ?? 'USD', participants),
  );

  // ── data state ──────────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState<Expense[]>(options.initialExpenses ?? []);
  const [payments, setPayments] = useState<Payment[]>(options.initialPayments ?? []);

  // Refs mirror state so async actions can snapshot for rollback.
  const expensesRef = useRef(expenses);
  const paymentsRef = useRef(payments);
  expensesRef.current = expenses;
  paymentsRef.current = payments;

  // Re-sync when the container supplies a fresh dataset (e.g. socket refetch).
  const optionExpenses = options.initialExpenses;
  const optionPayments = options.initialPayments;
  useEffect(() => {
    if (optionExpenses) setExpenses(optionExpenses);
  }, [optionExpenses]);
  useEffect(() => {
    if (optionPayments) setPayments(optionPayments);
  }, [optionPayments]);

  const fail = useCallback(
    (message: string) => {
      if (onError) onError(message);
      else console.error(message);
    },
    [onError],
  );

  // ── helpers ──────────────────────────────────────────────────────────────────
  const money = useMemo(() => createMoney(currencies, displayCurrency), [currencies, displayCurrency]);
  const pOf = useCallback(
    (id: string) => participants.find((p) => p.id === id) || participants[0],
    [participants],
  );

  // ── form actions ──────────────────────────────────────────────────────────────
  const setFormPatch = useCallback(
    (patch: Partial<ExpenseForm>) => setForm((prev) => ({ ...prev, ...patch })),
    [],
  );

  const setPercentFor = useCallback(
    (pid: string, value: string) =>
      setForm((prev) => ({ ...prev, percents: { ...prev.percents, [pid]: value } })),
    [],
  );
  const setCustomFor = useCallback(
    (pid: string, value: string) =>
      setForm((prev) => ({ ...prev, customs: { ...prev.customs, [pid]: value } })),
    [],
  );

  const toggleSplitter = useCallback((pid: string) => {
    setForm((prev) => {
      const has = prev.splitters.includes(pid);
      const splitters = has ? prev.splitters.filter((x) => x !== pid) : [...prev.splitters, pid];
      return { ...prev, splitters };
    });
  }, []);

  // ── sheet actions ─────────────────────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setForm(blankForm(displayCurrency, participants));
    setEditingId(null);
    setShowAdd(true);
  }, [displayCurrency, participants]);

  const closeAdd = useCallback(() => {
    setShowAdd(false);
    setEditingId(null);
  }, []);

  const editExpense = useCallback(
    (e: Expense) => {
      const splitters = e.splits.map((s) => s.pid);
      const percents: Record<string, string> = {};
      const customs: Record<string, string> = {};

      if (e.splitMethod === 'percent') {
        const totalUSD = toUSD(currencies, e.amount, e.currency);
        e.splits.forEach((s) => {
          percents[s.pid] = totalUSD
            ? String(Math.round((toUSD(currencies, s.amount, e.currency) / totalUSD) * 100))
            : '0';
        });
      }
      if (e.splitMethod === 'custom') {
        e.splits.forEach((s) => {
          customs[s.pid] = String(s.amount);
        });
      }

      setForm({
        title: e.title,
        amount: String(e.amount),
        currency: e.currency,
        category: e.category,
        description: e.description || '',
        date: e.date,
        location: e.location || '',
        paidBy: e.paidBy,
        splitters,
        splitMethod: e.splitMethod,
        percents,
        customs,
        receiptUrl: e.receiptUrl ?? null,
      });
      setEditingId(e.id);
      setShowAdd(true);
    },
    [currencies],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const prev = expensesRef.current;
      const next = prev.filter((e) => e.id !== id);
      setExpenses(next);
      setShowAdd(false);
      setEditingId(null);
      if (persistence) {
        persistence.deleteExpense(id).catch((err) => {
          setExpenses(prev);
          fail(err?.message || 'Failed to delete expense');
        });
      } else {
        onExpensesChange?.(next);
      }
    },
    [persistence, onExpensesChange, fail],
  );

  const toggleSettled = useCallback(
    (id: string) => {
      const prev = expensesRef.current;
      const target = prev.find((e) => e.id === id);
      if (!target) return;
      const nextSettled = !target.settled;
      setExpenses(prev.map((e) => (e.id === id ? { ...e, settled: nextSettled } : e)));
      if (persistence) {
        persistence
          .setSettled(id, nextSettled)
          .then((saved) => setExpenses((cur) => cur.map((e) => (e.id === id ? saved : e))))
          .catch((err) => {
            setExpenses(prev);
            fail(err?.message || 'Failed to update expense');
          });
      } else {
        onExpensesChange?.(expensesRef.current);
      }
    },
    [persistence, onExpensesChange, fail],
  );

  /**
   * Persist the current form as a new expense or an edit. `splits` are computed
   * by the sheet and passed in. Returns `false` when validation fails (so the
   * sheet stays open), `true` once the optimistic write is applied.
   */
  const saveExpense = useCallback(
    (splits: Expense['splits']): boolean => {
      const f = form;
      const amt = Number(f.amount) || 0;
      if (amt <= 0 || !f.title.trim() || f.splitters.length === 0) return false;

      const base = {
        title: f.title.trim(),
        description: f.description,
        amount: amt,
        currency: f.currency,
        category: f.category,
        date: f.date,
        location: f.location,
        paidBy: f.paidBy,
        splitMethod: f.splitMethod,
        splits,
        receiptUrl: f.receiptUrl,
      };

      const prev = expensesRef.current;

      if (editingId) {
        const id = editingId;
        const existing = prev.find((e) => e.id === id);
        const settled = existing?.settled ?? false;
        setExpenses(prev.map((e) => (e.id === id ? { ...e, ...base, settled } : e)));
        setShowAdd(false);
        setEditingId(null);
        if (persistence) {
          persistence
            .updateExpense(id, { ...base, settled })
            .then((saved) => setExpenses((cur) => cur.map((e) => (e.id === id ? saved : e))))
            .catch((err) => {
              setExpenses(prev);
              fail(err?.message || 'Failed to save expense');
            });
        } else {
          onExpensesChange?.(expensesRef.current);
        }
      } else {
        const tempId = 'tmp' + Date.now();
        const optimistic: Expense = { id: tempId, settled: false, ...base };
        setExpenses([optimistic, ...prev]);
        setShowAdd(false);
        setEditingId(null);
        if (persistence) {
          persistence
            .addExpense({ ...base, settled: false })
            .then((saved) => setExpenses((cur) => cur.map((e) => (e.id === tempId ? saved : e))))
            .catch((err) => {
              setExpenses((cur) => cur.filter((e) => e.id !== tempId));
              fail(err?.message || 'Failed to add expense');
            });
        } else {
          onExpensesChange?.(expensesRef.current);
        }
      }
      return true;
    },
    [form, editingId, persistence, onExpensesChange, fail],
  );

  // ── settle actions ────────────────────────────────────────────────────────────
  const settleUp = useCallback(
    (from: string, to: string, amountUSD: number) => {
      const rounded = Math.round(amountUSD * 100) / 100;
      const prev = paymentsRef.current;
      const tempId = 'tmp' + Date.now();
      const optimistic: Payment = { id: tempId, from, to, amountUSD: rounded, date: today() };
      setPayments([...prev, optimistic]);
      if (persistence) {
        persistence
          .addSettlement(from, to, rounded)
          .then((saved) => setPayments((cur) => cur.map((p) => (p.id === tempId ? saved : p))))
          .catch((err) => {
            setPayments((cur) => cur.filter((p) => p.id !== tempId));
            fail(err?.message || 'Failed to record settlement');
          });
      } else {
        onPaymentsChange?.(paymentsRef.current);
      }
    },
    [persistence, onPaymentsChange, fail],
  );

  const undoPayment = useCallback(
    (id: string) => {
      const prev = paymentsRef.current;
      setPayments(prev.filter((p) => p.id !== id));
      if (persistence) {
        persistence.removeSettlement(id).catch((err) => {
          setPayments(prev);
          fail(err?.message || 'Failed to undo settlement');
        });
      } else {
        onPaymentsChange?.(paymentsRef.current);
      }
    },
    [persistence, onPaymentsChange, fail],
  );

  return {
    // config / data
    participants,
    categories,
    currencies,
    tripBudgetUSD,
    expenses,
    payments,
    money,
    pOf,
    canEdit,
    uploadReceipt,

    // ui state
    tab,
    setTab,
    displayCurrency,
    setDisplayCurrency,
    fCat,
    setFCat,
    fPerson,
    setFPerson,
    settleView,
    setSettleView,

    // sheet / form
    showAdd,
    editingId,
    isEditing: !!editingId,
    form,
    setFormPatch,
    setPercentFor,
    setCustomFor,
    toggleSplitter,

    // actions
    openAdd,
    closeAdd,
    editExpense,
    deleteExpense,
    toggleSettled,
    saveExpense,
    settleUp,
    undoPayment,
  };
}

export type BudgetController = ReturnType<typeof useBudget>;
