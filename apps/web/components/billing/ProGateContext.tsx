import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SubscriptionSnapshot } from '../../types';
import { canUse as canUseFeature, isPro as isProSub, FeatureKey } from '../../lib/permissions';
import { PricingView } from './PricingView';

interface ProGateValue {
  subscription?: SubscriptionSnapshot | null;
  isPro: boolean;
  canUse: (feature: FeatureKey) => boolean;
  /** Open the pricing overlay, optionally noting which feature was attempted. */
  openPricing: (attemptedFeature?: string) => void;
}

const ProGateCtx = createContext<ProGateValue | null>(null);

export const useProGate = (): ProGateValue => {
  const ctx = useContext(ProGateCtx);
  if (!ctx) {
    // Safe fallback so a component used outside the provider never crashes.
    return { subscription: null, isPro: false, canUse: () => false, openPricing: () => {} };
  }
  return ctx;
};

interface ProGateProviderProps {
  subscription?: SubscriptionSnapshot | null;
  children: React.ReactNode;
}

/**
 * Wraps the authenticated app. Provides plan checks and a single place to open
 * the Pricing overlay (which handles the Stripe redirect). Because the overlay
 * lives here, any deep component can call `openPricing()` with no prop drilling.
 */
export const ProGateProvider: React.FC<ProGateProviderProps> = ({ subscription, children }) => {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [attempted, setAttempted] = useState<string | undefined>(undefined);

  const openPricing = useCallback((attemptedFeature?: string) => {
    setAttempted(attemptedFeature);
    setPricingOpen(true);
  }, []);

  const value = useMemo<ProGateValue>(
    () => ({
      subscription,
      isPro: isProSub(subscription),
      canUse: (feature: FeatureKey) => canUseFeature(feature, subscription),
      openPricing,
    }),
    [subscription, openPricing]
  );

  return (
    <ProGateCtx.Provider value={value}>
      {children}
      {pricingOpen && (
        <PricingView
          subscription={subscription}
          attemptedFeature={attempted}
          onClose={() => setPricingOpen(false)}
        />
      )}
    </ProGateCtx.Provider>
  );
};
