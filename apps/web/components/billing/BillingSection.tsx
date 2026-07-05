import React, { useEffect, useState } from 'react';
import { Sparkles, Loader, ExternalLink, ChevronRight } from 'lucide-react';
import { useProGate } from './ProGateContext';
import { fetchSubscription, openBillingPortal } from '../../lib/billingApi';

/**
 * Billing card for the Profile → Settings screen: current plan, status, renewal
 * date, and the entry points to upgrade (pricing overlay) or manage (Stripe
 * portal). Reads live billing detail from the server.
 */
export const BillingSection: React.FC = () => {
  const { isPro, openPricing } = useProGate();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchSubscription()
      .then((d) => active && setBilling(d.billing))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const renewal = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const statusLabel = () => {
    if (!isPro) return 'Free plan';
    if (billing?.cancelAtPeriodEnd) return 'Pro · cancels at period end';
    if (billing?.status === 'past_due') return 'Pro · payment past due';
    return billing?.billingCycle === 'annual' ? 'Pro · billed yearly' : 'Pro · billed monthly';
  };

  const manage = async () => {
    setError('');
    setBusy(true);
    try {
      await openBillingPortal();
    } catch (e: any) {
      setError(e?.message || 'Could not open the billing portal.');
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white ring-1 ring-stone-100 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-stone-100">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${isPro ? 'bg-[#3a5a40] text-white' : 'bg-stone-100 text-stone-500'}`}>
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-stone-800">{isPro ? 'Dayla Pro' : 'Free plan'}</p>
          <p className="text-xs text-stone-500">{loading ? 'Loading…' : statusLabel()}</p>
        </div>
      </div>

      {isPro && renewal && (
        <div className="px-5 py-3 text-sm text-stone-600 border-b border-stone-50">
          {billing?.cancelAtPeriodEnd ? 'Access until' : 'Renews on'} <span className="font-semibold text-stone-800">{renewal}</span>
        </div>
      )}

      <div className="p-4">
        {isPro ? (
          <button
            onClick={manage}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 text-stone-800 font-bold hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Manage subscription
          </button>
        ) : (
          <button
            onClick={() => openPricing()}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#3a5a40] text-white font-bold hover:bg-[#588157] transition-colors"
          >
            <span>Upgrade to Pro</span>
            <ChevronRight size={18} />
          </button>
        )}
        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
};
