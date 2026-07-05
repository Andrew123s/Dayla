import { API_BASE_URL, authFetch } from './api';

// Shapes returned by GET /api/billing/plans
export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual' | null;
  limits: { collaborators: number };
  features: Record<string, boolean>;
  purchasable: boolean;
}

export interface PlansCatalogue {
  free: PlanInfo;
  proMonthly: PlanInfo;
  proAnnual: PlanInfo;
  featureKeys: Record<string, string>;
}

async function json(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err: any = new Error(body.message || `Request failed (${res.status})`);
    err.code = body.code;
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function fetchPlans(): Promise<{ plans: PlansCatalogue; billingEnabled: boolean }> {
  const body = await json(await authFetch(`${API_BASE_URL}/api/billing/plans`));
  return body.data;
}

export async function fetchSubscription() {
  const body = await json(await authFetch(`${API_BASE_URL}/api/billing/subscription`));
  return body.data as {
    subscription: any;
    access: { isPro: boolean; plan: string; collaboratorLimit: number; features: Record<string, boolean> };
    billing: null | {
      amount: number; currency: string; billingCycle: string | null;
      currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; status: string;
    };
    billingEnabled: boolean;
  };
}

/** Start checkout for a cycle and redirect the browser to Stripe. */
export async function startCheckout(cycle: 'monthly' | 'annual'): Promise<void> {
  const body = await json(
    await authFetch(`${API_BASE_URL}/api/billing/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycle }),
    })
  );
  const url = body.data?.url;
  if (url) window.location.href = url;
  else throw new Error('Could not start checkout');
}

export interface AdminMetrics {
  currency: string;
  subscribers: { total: number; active: number; trialing: number; pastDue: number; canceled: number };
  revenue: { mrr: number; arr: number };
  growth: { newLast30Days: number };
  churn: { last30Days: number; rate: number };
  renewals: { next7Days: number; items: { name: string | null; email: string | null; billingCycle: string | null; currentPeriodEnd: string; amount: number }[] };
  checkout: { created: number; completed: number; conversionRate: number };
  generatedAt: string;
}

/** Admin only — returns 403 for non-admins (used to detect admin status). */
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const body = await json(await authFetch(`${API_BASE_URL}/api/billing/admin/metrics`));
  return body.data as AdminMetrics;
}

/** Open the Stripe billing portal (manage / cancel) and redirect. */
export async function openBillingPortal(): Promise<void> {
  const body = await json(
    await authFetch(`${API_BASE_URL}/api/billing/customer-portal`, { method: 'POST' })
  );
  const url = body.data?.url;
  if (url) window.location.href = url;
  else throw new Error('Could not open the billing portal');
}
