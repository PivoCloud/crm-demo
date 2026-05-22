'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  message: string;
  variant?: 'success' | 'error';
};

export default function NoticeAutoClose({ message, variant = 'success' }: Props) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/'), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      role="status"
      className={`mb-6 rounded-lg border-l-2 bg-[var(--surface-raised)] px-4 py-2 text-sm text-slate-200 ${variant === 'error' ? 'border-red-400' : 'border-emerald-400'}`}
    >
      {message}
    </div>
  );
}
