import React, { useEffect, useState } from 'react';
import { BarChart3, ChevronRight, X, Loader, Users, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { fetchAdminMetrics, AdminMetrics } from '../../lib/billingApi';

/**
 * Admin-only revenue & subscriber analytics. Self-probing: on mount it tries the
 * admin endpoint; non-admins get a 403 and this component renders nothing, so it
 * can be dropped into ProfileView unconditionally. Admins see an entry row that
 * opens the metrics overlay.
 */
export const AdminMetricsPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const m = await fetchAdminMetrics();
      setMetrics(m);
      setIsAdmin(true);
    } catch {
      /* non-admin (403) or error → stay hidden */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!isAdmin) return null;

  const money = (n: number) => `€${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between p-3 bg-white rounded-3xl border border-stone-100 shadow-sm hover:bg-stone-50 transition-colors active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3a5a40]/10 rounded-xl flex items-center justify-center">
            <BarChart3 size={18} className="text-[#3a5a40]" />
          </div>
          <span className="text-sm font-medium text-stone-700">Revenue &amp; subscribers</span>
        </div>
        <ChevronRight size={18} className="text-stone-400" />
      </button>

      {open && (
        <div className="absolute inset-0 z-[100] bg-black/50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Admin analytics">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[92%] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="shrink-0 bg-white px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#3a5a40] flex items-center gap-2">
                <BarChart3 size={20} /> Analytics
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={load} aria-label="Refresh" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                  <RefreshCw size={17} className={`text-stone-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                  <X size={20} className="text-stone-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!metrics ? (
                <div className="flex justify-center py-16 text-[#3a5a40]"><Loader className="animate-spin" /></div>
              ) : (
                <>
                  {/* Revenue */}
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="MRR" value={money(metrics.revenue.mrr)} accent />
                    <Stat label="ARR" value={money(metrics.revenue.arr)} accent />
                  </div>

                  {/* Subscribers */}
                  <div className="rounded-2xl bg-white ring-1 ring-stone-100 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mb-3 flex items-center gap-1.5">
                      <Users size={13} /> Subscribers
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <Mini label="Total" value={metrics.subscribers.total} />
                      <Mini label="Active" value={metrics.subscribers.active} good />
                      <Mini label="Trialing" value={metrics.subscribers.trialing} />
                      <Mini label="Past due" value={metrics.subscribers.pastDue} warn />
                      <Mini label="Canceled" value={metrics.subscribers.canceled} />
                      <Mini label="New 30d" value={metrics.growth.newLast30Days} good />
                    </div>
                  </div>

                  {/* Churn + conversion */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white ring-1 ring-stone-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1.5">
                        <TrendingUp size={13} /> Churn (30d)
                      </p>
                      <p className="text-2xl font-black text-stone-800">{pct(metrics.churn.rate)}</p>
                      <p className="text-xs text-stone-400">{metrics.churn.last30Days} canceled</p>
                    </div>
                    <div className="rounded-2xl bg-white ring-1 ring-stone-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mb-1">Checkout</p>
                      <p className="text-2xl font-black text-stone-800">{pct(metrics.checkout.conversionRate)}</p>
                      <p className="text-xs text-stone-400">{metrics.checkout.completed}/{metrics.checkout.created} completed</p>
                    </div>
                  </div>

                  {/* Upcoming renewals */}
                  <div className="rounded-2xl bg-white ring-1 ring-stone-100 overflow-hidden">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 px-4 pt-4 pb-2 flex items-center gap-1.5">
                      <Calendar size={13} /> Renewals · next 7 days ({metrics.renewals.next7Days})
                    </p>
                    {metrics.renewals.items.length === 0 ? (
                      <p className="px-4 pb-4 text-sm text-stone-400">None upcoming.</p>
                    ) : (
                      <div className="divide-y divide-stone-50">
                        {metrics.renewals.items.map((r, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-stone-700 truncate">{r.name || r.email || 'Member'}</p>
                              <p className="text-[11px] text-stone-400">
                                {r.billingCycle} · {new Date(r.currentPeriodEnd).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-stone-800">€{r.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-center text-[11px] text-stone-400">
                    Updated {new Date(metrics.generatedAt).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Stat: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`rounded-2xl p-4 ${accent ? 'bg-[#3a5a40] text-white' : 'bg-white ring-1 ring-stone-100'}`}>
    <p className={`text-[11px] font-bold uppercase tracking-wide ${accent ? 'text-white/70' : 'text-stone-400'}`}>{label}</p>
    <p className="text-2xl font-black mt-1">{value}</p>
  </div>
);

const Mini: React.FC<{ label: string; value: number; good?: boolean; warn?: boolean }> = ({ label, value, good, warn }) => (
  <div>
    <p className={`text-xl font-black ${warn ? 'text-amber-600' : good ? 'text-[#3a5a40]' : 'text-stone-800'}`}>{value}</p>
    <p className="text-[10px] font-semibold text-stone-400">{label}</p>
  </div>
);
