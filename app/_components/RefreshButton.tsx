'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function formatNow(): string {
  return new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium' }).format(new Date());
}

export default function RefreshButton() {
  const router = useRouter();
  // Lazy init runs on both SSR and client → server-time and client-time can
  // differ by a few hundred ms. Time labels are the textbook case for
  // suppressHydrationWarning: the value is intentionally dynamic and React
  // should not treat the SSR/CSR delta as a bug.
  const [timestamp, setTimestamp] = useState<string>(() => formatNow());

  function handleRefresh() {
    router.refresh();
    setTimestamp(formatNow());
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-50 hover:bg-white/5"
      >
        Actualiser
      </button>
      <span suppressHydrationWarning className="text-xs text-slate-500">
        Dernière actualisation : {timestamp}
      </span>
    </div>
  );
}
