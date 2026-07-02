import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Polished placeholder for Piko tabs that aren't built out yet. */
export function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col items-center justify-center text-center px-10"
    >
      <div className="grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500 ring-1 ring-emerald-100 mb-5">
        <Icon size={34} strokeWidth={2} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1.5">{title}</h2>
      <p className="text-sm text-slate-500 leading-relaxed max-w-[15rem]">{description}</p>
      <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
        Coming soon
      </span>
    </motion.div>
  );
}
