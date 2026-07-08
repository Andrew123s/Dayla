/**
 * Local debug harness for the embedded Trails map (NOT part of the app).
 *
 * Mounts the exact PikoPanel wrapper structure around <Piko embedded> with the
 * LOCAL data source (no backend needed), so the map's layout chain can be
 * measured in a real browser. Tiles will 403 on localhost (the MapTiler key is
 * origin-locked to daylapp.com) — that's fine: this harness diagnoses LAYOUT
 * (container/canvas sizes, controls, CSS), not tile delivery.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Piko, createLocalDataSource } from './features/piko';

function Harness() {
  const source = React.useMemo(() => createLocalDataSource(), []);
  return (
    // Replicates Dashboard → PikoPanel: absolute inset-0, flex column,
    // h-12 header, flex-1 relative content region.
    <div className="absolute inset-0 z-[60] bg-gray-50 flex flex-col">
      <div className="h-12 shrink-0 flex items-center gap-2 px-2 bg-white/90 border-b border-gray-100 pt-safe-top">
        <span className="font-bold text-slate-900 flex-1">Trails (debug harness)</span>
      </div>
      <div className="flex-1 relative">
        <Piko embedded dataSource={source} apiBase="" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
