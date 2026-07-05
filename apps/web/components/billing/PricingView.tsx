import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, Minus, Loader, Sparkles, ShieldCheck } from 'lucide-react';
import type { SubscriptionSnapshot } from '../../types';
import { isPro as isProSub } from '../../lib/permissions';
import { fetchPlans, startCheckout, openBillingPortal, PlansCatalogue } from '../../lib/billingApi';

interface PricingViewProps {
  subscription?: SubscriptionSnapshot | null;
  attemptedFeature?: string;
  onClose: () => void;
}

// Human labels for the "you tried to use X" banner.
const FEATURE_LABELS: Record<string, string> = {
  footprint: 'The Footprint Calculator',
  trails: 'Creating & group-planning trails',
  trailsCreate: 'Creating & group-planning trails',
  collaborators: 'Adding more collaborators',
};

// Comparison rows (label, free cell, pro cell). `true` renders a check, `false`
// a dash, a string renders as text.
const COMPARISON: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Create dashboards', free: true, pro: true },
  { label: 'Collaborators per plan', free: 'Up to 2', pro: 'Unlimited' },
  { label: 'Smart packing (Ntelipak)', free: true, pro: true },
  { label: 'Weather insights', free: true, pro: true },
  { label: 'Browse Piko trails', free: true, pro: true },
  { label: 'Create & group-plan trails', free: false, pro: true },
  { label: 'Footprint calculator', free: false, pro: true },
  { label: 'Priority feature access', free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="text-[#3a5a40] mx-auto" />;
  if (value === false) return <Minus size={16} className="text-stone-300 mx-auto" />;
  return <span className="text-[11px] font-semibold text-stone-600">{value}</span>;
}

export const PricingView: React.FC<PricingViewProps> = ({ subscription, attemptedFeature, onClose }) => {
  const [catalogue, setCatalogue] = useState<PlansCatalogue | null>(null);
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pro = isProSub(subscription);

  useEffect(() => {
    let active = true;
    fetchPlans()
      .then((d) => {
        if (!active) return;
        setCatalogue(d.plans);
        setBillingEnabled(d.billingEnabled);
      })
      .catch(() => active && setError('Could not load plans.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const proPlan = useMemo(
    () => (cycle === 'annual' ? catalogue?.proAnnual : catalogue?.proMonthly),
    [catalogue, cycle]
  );

  const handleUpgrade = async () => {
    setError('');
    setBusy(true);
    try {
      await startCheckout(cycle); // redirects to Stripe
    } catch (e: any) {
      setError(e?.message || 'Could not start checkout.');
      setBusy(false);
    }
  };

  const handleManage = async () => {
    setError('');
    setBusy(true);
    try {
      await openBillingPortal();
    } catch (e: any) {
      setError(e?.message || 'Could not open the billing portal.');
      setBusy(false);
    }
  };

  const banner = attemptedFeature ? FEATURE_LABELS[attemptedFeature] : null;

  return (
    <div className="absolute inset-0 z-[100] bg-black/50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Dayla Pro plans">
      <div className="bg-[#f7f3ee] w-full max-w-md h-[92%] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="shrink-0 bg-white px-5 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#3a5a40] flex items-center gap-2">
                <Sparkles size={22} className="text-[#588157]" /> Dayla Pro
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">Unlock trails, eco insights & unlimited collaborators</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 -mr-1 rounded-full hover:bg-stone-100 transition-colors">
              <X size={20} className="text-stone-500" />
            </button>
          </div>
          {banner && !pro && (
            <div className="mt-3 rounded-xl bg-[#3a5a40]/10 text-[#3a5a40] text-sm font-semibold px-3 py-2">
              {banner} is a Pro feature.
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex justify-center py-16 text-[#3a5a40]"><Loader className="animate-spin" /></div>
          ) : pro ? (
            // Already Pro
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-[#3a5a40] text-white grid place-items-center mx-auto mb-4">
                <ShieldCheck size={30} />
              </div>
              <h3 className="text-lg font-black text-stone-800">You're on Dayla Pro</h3>
              <p className="text-sm text-stone-500 mt-1 mb-6">
                {subscription?.cancelAtPeriodEnd
                  ? 'Your plan is set to cancel at the end of the period.'
                  : 'Thanks for supporting Dayla. Everything is unlocked.'}
              </p>
              <button
                onClick={handleManage}
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#3a5a40] text-white font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy && <Loader size={16} className="animate-spin" />} Manage subscription
              </button>
            </div>
          ) : (
            <>
              {/* Billing cycle toggle */}
              <div className="flex bg-stone-100 rounded-2xl p-1 mb-5">
                {(['monthly', 'annual'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                      cycle === c ? 'bg-white text-[#3a5a40] shadow-sm' : 'text-stone-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Pro price card */}
              <div className="rounded-3xl bg-white ring-1 ring-[#3a5a40]/15 shadow-sm p-5 mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-stone-900">€{proPlan?.price ?? (cycle === 'annual' ? 180 : 15)}</span>
                  <span className="text-stone-500 font-semibold">/{cycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {cycle === 'annual' ? 'Billed once a year' : 'Billed monthly · cancel anytime'}
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={busy || !billingEnabled || !proPlan?.purchasable}
                  className="mt-4 w-full py-3 rounded-xl bg-[#3a5a40] text-white font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy && <Loader size={16} className="animate-spin" />} Upgrade to Pro
                </button>
                {!billingEnabled && (
                  <p className="text-xs text-amber-600 text-center mt-2">Checkout isn't available right now.</p>
                )}
              </div>

              {/* Comparison table */}
              <div className="rounded-2xl bg-white ring-1 ring-stone-100 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 border-b border-stone-100 text-[11px] font-bold uppercase tracking-wide text-stone-400">
                  <span>Feature</span>
                  <span className="w-14 text-center">Free</span>
                  <span className="w-14 text-center text-[#3a5a40]">Pro</span>
                </div>
                {COMPARISON.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 border-b border-stone-50 last:border-0">
                    <span className="text-[13px] text-stone-700">{row.label}</span>
                    <span className="w-14 text-center"><Cell value={row.free} /></span>
                    <span className="w-14 text-center"><Cell value={row.pro} /></span>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};
