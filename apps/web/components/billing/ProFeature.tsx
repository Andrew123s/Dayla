import React from 'react';
import { Lock } from 'lucide-react';
import { useProGate } from './ProGateContext';
import type { FeatureKey } from '../../lib/permissions';

interface ProFeatureProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /**
   * 'gate'  — show children (visible but locked); a click opens pricing + a
   *           lock badge appears. Good for buttons/tiles (shop-window feel).
   * 'block' — replace children with an upgrade card. Good for whole panels.
   */
  mode?: 'gate' | 'block';
  /** Human label used in the upgrade prompt / aria. */
  label?: string;
  className?: string;
  /** Show the small lock badge on gated children (default true). */
  badge?: boolean;
}

/**
 * Declarative Pro gate. When the user's plan grants `feature`, renders children
 * unchanged. Otherwise gates them and routes taps to the pricing overlay. This
 * is UX only — the server independently re-checks every Pro action.
 */
export const ProFeature: React.FC<ProFeatureProps> = ({
  feature,
  children,
  mode = 'gate',
  label,
  className = '',
  badge = true,
}) => {
  const { canUse, openPricing } = useProGate();

  if (canUse(feature)) return <>{children}</>;

  if (mode === 'block') {
    return (
      <div className={`rounded-2xl border border-dashed border-[#3a5a40]/30 bg-[#3a5a40]/5 p-5 text-center ${className}`}>
        <div className="w-11 h-11 rounded-xl bg-[#3a5a40]/10 text-[#3a5a40] grid place-items-center mx-auto mb-3">
          <Lock size={20} />
        </div>
        <p className="text-sm font-bold text-stone-800">{label || 'This is a Pro feature'}</p>
        <button
          onClick={() => openPricing(feature)}
          className="mt-3 px-5 py-2 rounded-full bg-[#3a5a40] text-white text-sm font-bold hover:bg-[#588157] transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  // gate mode
  return (
    <div className={`relative inline-flex ${className}`}>
      <div className="pointer-events-none">{children}</div>
      <button
        type="button"
        onClick={() => openPricing(feature)}
        aria-label={`${label || 'Feature'} — upgrade to Pro to unlock`}
        className="absolute inset-0 z-10"
      />
      {badge && (
        <span className="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full bg-[#3a5a40] text-white grid place-items-center ring-2 ring-white pointer-events-none">
          <Lock size={9} />
        </span>
      )}
    </div>
  );
};
