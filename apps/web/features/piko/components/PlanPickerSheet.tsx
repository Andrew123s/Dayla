import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Loader2, AlertCircle, CalendarPlus, ChevronRight, MapPin } from 'lucide-react';
import { PikoPlan, Route } from '../types';

interface PlanPickerSheetProps {
  open: boolean;
  route: Route | null;
  plans: PikoPlan[];
  loading: boolean;
  error: string | null;
  /** Plan id currently being added. */
  addingId: string | null;
  /** Plan id that was just added (shows a check, then auto-closes). */
  addedId: string | null;
  onClose: () => void;
  onPick: (planId: string) => void;
  onRetry: () => void;
}

/** Choose which group plan (Dayla trip) to attach a route to. */
export function PlanPickerSheet({
  open,
  route,
  plans,
  loading,
  error,
  addingId,
  addedId,
  onClose,
  onPick,
  onRetry,
}: PlanPickerSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[65] bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label="Add to a plan"
            className="absolute bottom-0 inset-x-0 z-[65] bg-white rounded-t-3xl pb-safe shadow-2xl max-h-[80%] flex flex-col"
          >
            <div className="flex justify-center pt-3 shrink-0">
              <span className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 pt-3 shrink-0">
              <h2 className="text-xl font-black text-slate-900">Add to a plan</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid place-items-center w-8 h-8 rounded-full bg-gray-100 text-slate-500 hover:bg-gray-200 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
            {route && (
              <p className="px-5 text-sm text-slate-500 mb-3 shrink-0 truncate">
                <span className="font-semibold text-slate-700">{route.title}</span> · {route.location}
              </p>
            )}

            <div className="px-4 pb-5 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="grid place-items-center py-12 text-emerald-500">
                  <Loader2 size={26} className="animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center text-center py-10 px-6">
                  <AlertCircle size={22} className="text-rose-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 mb-4">{error}</p>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
                  >
                    Try again
                  </button>
                </div>
              ) : plans.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 px-6">
                  <div className="grid place-items-center w-12 h-12 rounded-2xl bg-gray-50 text-slate-400 ring-1 ring-gray-100 mb-3">
                    <MapPin size={22} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No plans yet</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-[16rem]">
                    Create a trip in your planner first, then add this route to it.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {plans.map((plan) => {
                    const isAdding = addingId === plan.id;
                    const isAdded = addedId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        disabled={isAdding || isAdded || !!addingId}
                        onClick={() => onPick(plan.id)}
                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                          isAdded
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-gray-100 hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60'
                        }`}
                      >
                        <span
                          className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 ${
                            isAdded ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isAdded ? <Check size={20} /> : <CalendarPlus size={20} />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 truncate">{plan.name}</span>
                          {plan.subtitle && <span className="block text-sm text-slate-500 truncate">{plan.subtitle}</span>}
                        </span>
                        {isAdding ? (
                          <Loader2 size={18} className="text-emerald-500 animate-spin shrink-0" />
                        ) : isAdded ? (
                          <span className="text-xs font-bold text-emerald-600 shrink-0">Added</span>
                        ) : (
                          <ChevronRight size={18} className="text-gray-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
