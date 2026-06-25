// ─────────────────────────────────────────────────────────────────────────────
// Budget API client + mappers
//
// Bridges the backend budget endpoints (and the existing upload pipeline) to the
// Budget module's data shapes. Server documents use `_id` and `paidBy`/`splits[].
// user` references; the module uses `id` and `pid`. These helpers translate
// between the two and centralize the authenticated requests.
// ─────────────────────────────────────────────────────────────────────────────

import { API_BASE_URL, authFetch } from './api';
import type { Currency, Expense, Participant, Payment } from '../components/budget';
import type { ExpenseInput } from '../components/budget/hooks/useBudget';

interface ServerSplit {
  user: string;
  amount: number;
}

interface ServerExpense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  amountUSD: number;
  category: string;
  date: string;
  location?: string;
  paidBy: string;
  splitMethod: Expense['splitMethod'];
  splits: ServerSplit[];
  receiptUrl?: string | null;
  settled?: boolean;
}

interface ServerSettlement {
  _id: string;
  from: string;
  to: string;
  amountUSD: number;
  date: string;
}

export interface BudgetSnapshot {
  expenses: Expense[];
  payments: Payment[];
  budgetUSD: number;
  currencies: Currency[];
}

// ── mappers ──────────────────────────────────────────────────────────────────
function toExpense(doc: ServerExpense): Expense {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description || '',
    amount: doc.amount,
    currency: doc.currency,
    category: doc.category,
    date: doc.date,
    location: doc.location || '',
    paidBy: String(doc.paidBy),
    splitMethod: doc.splitMethod,
    splits: (doc.splits || []).map((s) => ({ pid: String(s.user), amount: s.amount })),
    receiptUrl: doc.receiptUrl ?? null,
    settled: !!doc.settled,
  };
}

function toPayment(doc: ServerSettlement): Payment {
  return {
    id: String(doc._id),
    from: String(doc.from),
    to: String(doc.to),
    amountUSD: doc.amountUSD,
    date: doc.date,
  };
}

function toExpenseBody(input: ExpenseInput) {
  return {
    title: input.title,
    description: input.description || '',
    amount: input.amount,
    currency: input.currency,
    category: input.category,
    date: input.date,
    location: input.location || '',
    paidBy: input.paidBy,
    splitMethod: input.splitMethod,
    splits: input.splits.map((s) => ({ user: s.pid, amount: s.amount })),
    receiptUrl: input.receiptUrl ?? null,
    settled: input.settled,
  };
}

// ── request helper ─────────────────────────────────────────────────────────────
async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await authFetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

// ── budget reads ───────────────────────────────────────────────────────────────
export async function fetchBudget(tripId: string): Promise<BudgetSnapshot> {
  const data = await request<{
    expenses: ServerExpense[];
    settlements: ServerSettlement[];
    budgetUSD: number;
    currencies: Currency[];
  }>('GET', `/api/trips/${tripId}/expenses`);

  return {
    expenses: (data.expenses || []).map(toExpense),
    payments: (data.settlements || []).map(toPayment),
    budgetUSD: data.budgetUSD || 0,
    currencies: data.currencies || [],
  };
}

export interface TripMember {
  _id: string;
  name: string;
  avatar?: string;
}

export interface TripInfo {
  id: string;
  name: string;
  owner: TripMember;
  collaborators: TripMember[];
}

export async function fetchTrip(tripId: string): Promise<TripInfo> {
  const data = await request<{ trip: any }>('GET', `/api/trips/${tripId}`);
  const t = data.trip;
  return {
    id: String(t._id),
    name: t.name,
    owner: t.owner,
    collaborators: t.collaborators || [],
  };
}

// ── budget writes ──────────────────────────────────────────────────────────────
export async function createExpense(tripId: string, input: ExpenseInput): Promise<Expense> {
  const data = await request<{ expense: ServerExpense }>('POST', `/api/trips/${tripId}/expenses`, toExpenseBody(input));
  return toExpense(data.expense);
}

export async function updateExpense(tripId: string, id: string, input: ExpenseInput): Promise<Expense> {
  const data = await request<{ expense: ServerExpense }>('PUT', `/api/trips/${tripId}/expenses/${id}`, toExpenseBody(input));
  return toExpense(data.expense);
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  await request('DELETE', `/api/trips/${tripId}/expenses/${id}`);
}

export async function setExpenseSettled(tripId: string, id: string, settled: boolean): Promise<Expense> {
  const data = await request<{ expense: ServerExpense }>('PATCH', `/api/trips/${tripId}/expenses/${id}/settled`, { settled });
  return toExpense(data.expense);
}

export async function createSettlement(tripId: string, from: string, to: string, amountUSD: number): Promise<Payment> {
  const data = await request<{ settlement: ServerSettlement }>('POST', `/api/trips/${tripId}/settlements`, { from, to, amountUSD });
  return toPayment(data.settlement);
}

export async function deleteSettlement(tripId: string, id: string): Promise<void> {
  await request('DELETE', `/api/trips/${tripId}/settlements/${id}`);
}

// ── receipt upload (reuses the existing upload pipeline) ─────────────────────────
export async function uploadReceipt(file: File): Promise<string> {
  const isPdf = file.type === 'application/pdf';
  const path = isPdf ? '/api/upload/documents' : '/api/upload/images';
  const field = isPdf ? 'document' : 'image';
  const fd = new FormData();
  fd.append(field, file);

  const res = await authFetch(`${API_BASE_URL}${path}`, { method: 'POST', body: fd });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok || json.success === false || !json.data?.url) {
    throw new Error(json.message || 'Receipt upload failed');
  }
  return json.data.url as string;
}

// ── participant helpers ──────────────────────────────────────────────────────────
const PALETTE = ['#3a5a40', '#c1734a', '#4f7a99', '#9a6a9c', '#7c9b86', '#d2a93f', '#c98694', '#a9a396'];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name || 'User';
}

export function buildParticipants(trip: TripInfo, currentUserId: string): Participant[] {
  const members: TripMember[] = [trip.owner, ...trip.collaborators].filter(Boolean);
  const seen = new Set<string>();
  const out: Participant[] = [];
  for (const m of members) {
    const id = String(m._id);
    if (seen.has(id)) continue;
    seen.add(id);
    const you = id === String(currentUserId);
    out.push({
      id,
      name: shortName(m.name),
      full: you ? `${m.name} (You)` : m.name,
      initials: initialsOf(m.name),
      color: colorForId(id),
      you,
    });
  }
  return out;
}
