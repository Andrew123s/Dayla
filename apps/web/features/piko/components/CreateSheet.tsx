import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LocateFixed, PenLine, Upload, X, ChevronRight, LucideIcon } from 'lucide-react';

interface CreateSheetProps {
  open: boolean;
  onClose: () => void;
  onUploadGpx: (file: File) => void;
  /** Open the draw-on-the-map flow. */
  onDraw: () => void;
  /** Open the record-with-GPS flow. */
  onRecord: () => void;
}

type Option = {
  id: 'record' | 'draw' | 'gpx';
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
  ready: boolean;
};

const OPTIONS: Option[] = [
  { id: 'record', icon: LocateFixed, title: 'Record with GPS', desc: 'Track your hike live as you walk it.', accent: 'bg-emerald-50 text-emerald-600', ready: true },
  { id: 'draw', icon: PenLine, title: 'Draw on the map', desc: 'Snap waypoints to trails by hand.', accent: 'bg-sky-50 text-sky-600', ready: true },
  { id: 'gpx', icon: Upload, title: 'Upload a GPX file', desc: 'Import a route from a watch or another app.', accent: 'bg-violet-50 text-violet-600', ready: true },
];

export function CreateSheet({ open, onClose, onUploadGpx, onDraw, onRecord }: CreateSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (file) onUploadGpx(file);
  };

  const handleOption = (opt: Option) => {
    if (!opt.ready) return;
    if (opt.id === 'gpx') fileRef.current?.click();
    else if (opt.id === 'draw') onDraw();
    else if (opt.id === 'record') onRecord();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label="Create a route"
            className="absolute bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl pb-safe shadow-2xl"
          >
            <div className="flex justify-center pt-3">
              <span className="w-10 h-1.5 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <h2 className="text-xl font-black text-slate-900">Create a route</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid place-items-center w-8 h-8 rounded-full bg-gray-100 text-slate-500 hover:bg-gray-200 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
            <p className="px-5 text-sm text-slate-500 mb-3">Share your favourite trails with the community.</p>

            {/* Hidden GPX picker */}
            <input
              ref={fileRef}
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              onChange={handleFile}
              className="hidden"
            />

            <div className="px-4 pb-5 flex flex-col gap-2.5">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!opt.ready}
                    onClick={() => handleOption(opt)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 text-left transition-all ${
                      opt.ready ? 'hover:bg-gray-50 active:scale-[0.99]' : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 ${opt.accent}`}>
                      <Icon size={21} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 font-bold text-slate-800">
                        {opt.title}
                        {!opt.ready && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-slate-500">{opt.desc}</span>
                    </span>
                    {opt.ready && <ChevronRight size={18} className="text-gray-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
