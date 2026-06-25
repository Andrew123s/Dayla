// ─────────────────────────────────────────────────────────────────────────────
// BudgetPanel — the Dayla integration container for the Budget module.
//
// Owns all data fetching for a trip's budget: trip members → participants, live
// FX currencies, expenses, and settlements. Wires every module action to the
// backend (optimistic via useBudget), refetches on the `budget:updated` socket
// event for real-time collaboration, and renders loading / error / empty states.
// The visual design of <BudgetModule/> is untouched.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '../../types';
import { getSocket } from '../../lib/socket';
import {
  buildParticipants,
  createExpense,
  createSettlement,
  deleteExpense,
  deleteSettlement,
  fetchBudget,
  fetchTrip,
  setExpenseSettled,
  updateExpense,
  uploadReceipt,
  type TripInfo,
} from '../../lib/budgetApi';
import { BudgetModule } from './components/BudgetModule';
import type { BudgetPersistence } from './hooks/useBudget';
import type { Currency, Expense, Participant, Payment } from './types';
import './styles/budget.css';

interface BudgetPanelProps {
  tripId: string;
  currentUser: User;
}

type Status = 'loading' | 'ready' | 'error';

const SHELL: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: '#f4f1ea',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: 28,
  fontFamily: "'Inter', system-ui, sans-serif",
};

export function BudgetPanel({ tripId, currentUser }: BudgetPanelProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string>('');
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [budgetUSD, setBudgetUSD] = useState<number>(0);
  const [toast, setToast] = useState<string>('');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);

  const loadAll = useCallback(async () => {
    if (!tripId) return;
    setStatus('loading');
    setError('');
    try {
      const [tripInfo, snap] = await Promise.all([fetchTrip(tripId), fetchBudget(tripId)]);
      setTrip(tripInfo);
      setExpenses(snap.expenses);
      setPayments(snap.payments);
      setCurrencies(snap.currencies);
      setBudgetUSD(snap.budgetUSD);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget');
      setStatus('error');
    }
  }, [tripId]);

  const refetchBudget = useCallback(async () => {
    if (!tripId) return;
    try {
      const snap = await fetchBudget(tripId);
      setExpenses(snap.expenses);
      setPayments(snap.payments);
      setCurrencies(snap.currencies);
      setBudgetUSD(snap.budgetUSD);
    } catch {
      /* keep current data on a transient refetch failure */
    }
  }, [tripId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time: refetch whenever a collaborator (or this user) changes the budget.
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !tripId) return;
    const handler = (data: { tripId?: string }) => {
      if (!data || data.tripId === tripId) refetchBudget();
    };
    socket.on('budget:updated', handler);
    return () => {
      socket.off('budget:updated', handler);
    };
  }, [tripId, refetchBudget]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const participants = useMemo<Participant[]>(
    () => (trip ? buildParticipants(trip, currentUser.id) : []),
    [trip, currentUser.id],
  );

  // Owner + collaborators can edit (trip membership). If the data loaded, the
  // user is a member, so editing is allowed.
  const canEdit = true;

  const persistence = useMemo<BudgetPersistence>(
    () => ({
      addExpense: (input) => createExpense(tripId, input),
      updateExpense: (id, input) => updateExpense(tripId, id, input),
      deleteExpense: (id) => deleteExpense(tripId, id),
      setSettled: (id, settled) => setExpenseSettled(tripId, id, settled),
      addSettlement: (from, to, amountUSD) => createSettlement(tripId, from, to, amountUSD),
      removeSettlement: (id) => deleteSettlement(tripId, id),
    }),
    [tripId],
  );

  if (!tripId) {
    return (
      <div style={SHELL}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#2c352c' }}>No trip selected</div>
        <div style={{ fontSize: 13, color: '#7a7468', marginTop: 6, maxWidth: 280 }}>
          Create or open a trip to start tracking shared expenses.
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div style={SHELL}>
        <div className="bud-spinner" />
        <div style={{ fontSize: 13, color: '#7a7468', marginTop: 14 }}>Loading budget…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={SHELL}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#2c352c' }}>Couldn’t load the budget</div>
        <div style={{ fontSize: 13, color: '#c06a5e', marginTop: 6, maxWidth: 300 }}>{error}</div>
        <button
          onClick={loadAll}
          style={{ marginTop: 16, background: '#3a5a40', color: '#fff', border: 'none', borderRadius: 14, padding: '11px 22px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <BudgetModule
        eyebrow="Trip Budget"
        title={trip?.name || 'Trip Budget'}
        participants={participants}
        currencies={currencies}
        tripBudgetUSD={budgetUSD}
        initialExpenses={expenses}
        initialPayments={payments}
        initialCurrency="USD"
        canEdit={canEdit}
        persistence={persistence}
        uploadReceipt={uploadReceipt}
        onError={showToast}
      />
      {toast && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 92,
            transform: 'translateX(-50%)',
            zIndex: 90,
            background: '#3a3530',
            color: '#fff',
            padding: '11px 18px',
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 600,
            maxWidth: '88%',
            textAlign: 'center',
            boxShadow: '0 12px 28px -10px rgba(0,0,0,.5)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

export default BudgetPanel;
