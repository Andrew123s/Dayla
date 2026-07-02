import { Leaf, Sprout, ArrowRight } from 'lucide-react';
import { EcoImpact } from '../types';

interface EcoImpactCardProps {
  impact: EcoImpact;
}

export function EcoImpactCard({ impact }: EcoImpactCardProps) {
  // Scale the bar against a 10kg reference so small trips read as low-impact.
  const pct = Math.min(100, Math.round((impact.co2EstimateKg / 10) * 100));
  const isClean = impact.co2EstimateKg === 0;

  return (
    <section className="rounded-3xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="grid place-items-center w-11 h-11 rounded-2xl bg-white text-emerald-600 shadow-sm">
          <Leaf size={22} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Eco-impact report</h3>
          <p className="text-sm text-emerald-700/80">Estimated for reaching the trailhead.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">
            By {impact.transportMode}
          </span>
          <span className={`text-sm font-bold ${isClean ? 'text-emerald-600' : 'text-rose-500'}`}>
            {isClean ? 'Zero emissions' : `${impact.co2EstimateKg} kg CO₂`}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${isClean ? 'bg-emerald-400' : 'bg-rose-400'}`}
            style={{ width: `${isClean ? 6 : pct}%` }}
          />
        </div>
      </div>

      {impact.greenerAlternatives.length > 0 && (
        <div className="mt-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-800/80 uppercase tracking-wide mb-2">
            <Sprout size={13} />
            Greener ways to get there
          </h4>
          <div className="flex flex-col gap-2">
            {impact.greenerAlternatives.map((alt, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 bg-white/70 text-emerald-900 text-sm font-medium px-3.5 py-2.5 rounded-xl border border-emerald-100"
              >
                <span>{alt}</span>
                <ArrowRight size={15} className="text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
