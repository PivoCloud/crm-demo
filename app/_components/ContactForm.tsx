'use client';
// Client component for adding or editing a contact.
// Uses useActionState + useFormStatus (React 19 / react-dom).
// Phase 2 / Plan 02 / Task 4 — CRUD complet (create mode).
// Phase 2 / Plan 03 / Task 3 — polymorphic: create OR update mode via props.
// Phase 4 / Plan 04-04 / Task 1 — dark skin: card-wrap D-18, inputs dark D-19, submit blue-600 D-20.

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createContactAction } from '@/app/actions/contacts';
import {
  INITIAL_CONTACT_FORM_STATE,
  type ContactFormState,
} from '@/app/actions/contact-form-state';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type ContactFormProps = {
  initialContact?: { id: string; name: string; email: string; phone: string | null };
  action?: (prevState: ContactFormState, formData: FormData) => Promise<ContactFormState>;
  submitLabel?: string;
};

// ---------------------------------------------------------------------------
// SubmitButton — isolated so it can call useFormStatus inside the form tree
// ---------------------------------------------------------------------------
function SubmitButton({ submitLabel }: { submitLabel: string }) {
  const { pending } = useFormStatus();
  const pendingLabel = `${submitLabel}…`;
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
    >
      {pending ? pendingLabel : submitLabel}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ContactForm
// ---------------------------------------------------------------------------
export default function ContactForm({
  initialContact,
  action,
  submitLabel = 'Ajouter',
}: ContactFormProps = {}) {
  const boundAction = action ?? createContactAction;
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    boundAction,
    INITIAL_CONTACT_FORM_STATE,
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form fields after a successful submission in create mode only.
  // In update mode, the server redirects to / — no client-side reset needed.
  useEffect(() => {
    if (state.ok && !initialContact) {
      formRef.current?.reset();
    }
  }, [state, initialContact]);

  return (
    <div className="rounded-2xl border border-white/6 bg-[var(--surface-raised)] p-6 mb-6 max-w-md">
      <form ref={formRef} action={formAction} className="space-y-4">
        {/* Global success / error banner */}
        {state.message && state.ok && (
          <p className="rounded-lg border-l-2 border-emerald-400 bg-[var(--surface-darkest)] px-3 py-2 text-sm text-slate-200">
            {state.message}
          </p>
        )}
        {state.message && !state.ok && !state.errors && (
          <p
            role="alert"
            className="rounded-lg border-l-2 border-red-400 bg-[var(--surface-darkest)] px-3 py-2 text-sm text-slate-200"
          >
            {state.message}
          </p>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="cf-name" className="text-sm font-medium text-slate-300">
            Nom <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={state.values?.name ?? initialContact?.name ?? ''}
            aria-invalid={!!state.errors?.name}
            className="rounded-lg border border-white/6 bg-[var(--surface-darkest)] px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 aria-invalid:border-red-400 aria-invalid:ring-red-400/30"
          />
          {state.errors?.name && (
            <p role="alert" className="text-sm text-red-400">
              {state.errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="cf-email" className="text-sm font-medium text-slate-300">
            Email <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            maxLength={200}
            defaultValue={state.values?.email ?? initialContact?.email ?? ''}
            aria-invalid={!!state.errors?.email}
            className="rounded-lg border border-white/6 bg-[var(--surface-darkest)] px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 aria-invalid:border-red-400 aria-invalid:ring-red-400/30"
          />
          {state.errors?.email && (
            <p role="alert" className="text-sm text-red-400">
              {state.errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label htmlFor="cf-phone" className="text-sm font-medium text-slate-300">
            Téléphone
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={state.values?.phone ?? initialContact?.phone ?? ''}
            aria-invalid={!!state.errors?.phone}
            className="rounded-lg border border-white/6 bg-[var(--surface-darkest)] px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 aria-invalid:border-red-400 aria-invalid:ring-red-400/30"
          />
          {state.errors?.phone && (
            <p role="alert" className="text-sm text-red-400">
              {state.errors.phone}
            </p>
          )}
        </div>

        <SubmitButton submitLabel={submitLabel} />
      </form>
    </div>
  );
}
