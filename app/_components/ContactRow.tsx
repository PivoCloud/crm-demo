'use client';
// Client component for a single contact row.
// Renders name/email/phone + inline actions (Modifier link + Supprimer button).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { deleteContactAction } from '@/app/actions/contacts';

// Minimal local type — do NOT import Contact from lib/db/contacts (server-only module).
type Props = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Suppression…' : 'Supprimer'}
    </button>
  );
}

export default function ContactRow({ id, name, email, phone }: Props) {
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`grid grid-cols-[1.5fr_2fr_1.2fr_auto] items-center gap-6 px-5 sm:px-6 py-3 border-b border-white/6 last:border-b-0 ${flash ? 'animate-row-flash' : ''}`}
    >
      <span className="text-base font-semibold text-slate-50 truncate">{name}</span>
      <span className="text-sm text-slate-300 truncate">{email}</span>
      <span className="text-sm text-slate-400 tabular-nums">{phone ?? '—'}</span>
      <div className="flex justify-end items-center gap-3">
        <Link
          href={`/contacts/${id}/edit`}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          Modifier
        </Link>
        <form action={deleteContactAction.bind(null, id)} className="inline">
          <DeleteButton />
        </form>
      </div>
    </div>
  );
}
