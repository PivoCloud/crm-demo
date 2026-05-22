'use client';

import { useFormStatus } from 'react-dom';
import { seedDemoContactsAction } from '@/app/actions/contacts';

function SeedSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Préparation…' : 'Préparer démo'}
    </button>
  );
}

export default function SeedDemoButton() {
  return (
    <form action={seedDemoContactsAction}>
      <SeedSubmitButton />
    </form>
  );
}
