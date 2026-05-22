// Shared types for the ContactForm state machine.
// Importable from both Server Components and Client Components.
// This file has NO 'use server' or 'use client' directive — it is isomorphic.
//
// Phase 2 / Plan 03 — extracted from app/actions/contacts.ts so that
// INITIAL_CONTACT_FORM_STATE (a plain object) is not gated behind 'use server'
// (Next.js 16 enforces that 'use server' files export only async functions).

export type ContactFormState = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
  values?: { name?: string; email?: string; phone?: string };
};

export const INITIAL_CONTACT_FORM_STATE: ContactFormState = { ok: false };
