'use server';
// Server Action for contact mutations.
// Phase 2 / Plan 02 / Task 3 — createContactAction.
// Phase 2 / Plan 03 / Task 2 — updateContactAction, deleteContactAction.
// Phase 2 / Plan 03 / Task 5 (fix) — ContactFormState + INITIAL_CONTACT_FORM_STATE
//   live in app/actions/contact-form-state.ts (no directive).
//   Reason: Next.js 16 enforces 'use server' files may only export async functions.
//   INITIAL_CONTACT_FORM_STATE is a plain object — re-exporting it from 'use server'
//   triggers "Only async functions are allowed to be exported" build error.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContactCreateSchema, ContactUpdateSchema } from '@/lib/validation/contacts';
import { createContact, updateContact, deleteContact, bulkInsertIfEmpty } from '@/lib/db/contacts';
import type { ContactFormState } from '@/app/actions/contact-form-state';

export async function createContactAction(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  };

  const result = ContactCreateSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const key of Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>) {
      const msgs = fieldErrors[key];
      if (msgs && msgs.length > 0) {
        errors[key] = msgs[0];
      }
    }
    return {
      ok: false,
      errors,
      values: {
        name: String(raw.name ?? ''),
        email: String(raw.email ?? ''),
        phone: String(raw.phone ?? ''),
      },
    };
  }

  try {
    await createContact(result.data);
  } catch (err) {
    // Log server-side only — never expose DB error details to the client (T-02-06).
    console.error('[actions/contacts] createContactAction failed:', err);
    return { ok: false, message: 'Erreur serveur. Veuillez réessayer.' };
  }

  revalidatePath('/');
  return { ok: true, message: 'Contact ajouté.' };
}

/**
 * Update an existing contact. Designed to be bound with `.bind(null, id)` when
 * used with useActionState, e.g.: `const boundAction = updateContactAction.bind(null, id)`.
 *
 * On success: revalidates / and /contacts/[id]/edit, then redirects to /.
 * On validation failure: returns { ok: false, errors, values } for inline display.
 * On not-found: returns { ok: false, message: 'Contact introuvable.' }.
 * On DB error: logs server-side only, returns generic message (T-03-06 mitigation).
 */
export async function updateContactAction(
  id: string,
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  };

  const result = ContactUpdateSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const key of Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>) {
      const msgs = fieldErrors[key];
      if (msgs && msgs.length > 0) {
        errors[key] = msgs[0];
      }
    }
    return {
      ok: false,
      errors,
      values: {
        name: String(raw.name ?? ''),
        email: String(raw.email ?? ''),
        phone: String(raw.phone ?? ''),
      },
    };
  }

  try {
    const updated = await updateContact(id, result.data);
    if (updated === null) {
      return { ok: false, message: 'Contact introuvable.' };
    }
  } catch (err) {
    // Log server-side only — never expose DB error details to the client (T-03-06).
    console.error('[actions/contacts] updateContactAction failed:', err);
    return { ok: false, message: 'Erreur serveur. Veuillez réessayer.' };
  }

  revalidatePath('/');
  revalidatePath('/contacts/' + id + '/edit');
  redirect('/?notice=updated');
}

/**
 * Delete a contact by id. Designed to be bound with `.bind(null, id)`.
 * Used with a plain <form action={...}> in ContactRow (no useActionState needed).
 *
 * On success: revalidates / and returns { ok: true }.
 * On not-found: returns { ok: false, message: 'Contact introuvable.' }.
 * On DB error: logs server-side only, returns generic message (T-03-06 mitigation).
 */
/**
 * Seed the demo dataset (5 DZ contacts from D-19) — idempotent.
 * Fixed data, no validation needed. Errors logged server-side; user is
 * redirected with ?notice=seed-error so the existing banner pipeline can
 * surface a fallback message if needed (not currently rendered).
 */
export async function seedDemoContactsAction(): Promise<void> {
  // Canonical pattern (see deleteContactAction / updateContactAction):
  // catch handles error state ONLY, redirect() stays outside the try/catch
  // so its NEXT_REDIRECT throw is never at risk of being swallowed. The
  // previous shape worked by accident — the in-catch redirect re-threw
  // out of the catch with nothing left to rescue it — but it was fragile
  // and inconsistent with the other actions in this file.
  let seedError = false;
  try {
    await bulkInsertIfEmpty();
  } catch (err) {
    console.error('[actions/contacts] seedDemoContactsAction failed:', err);
    seedError = true;
  }

  if (seedError) {
    // Do NOT revalidatePath on error — the table state did not change.
    redirect('/?notice=seed-error');
  }

  revalidatePath('/');
  redirect('/?notice=seeded');
}

export async function deleteContactAction(id: string): Promise<void> {
  // Return type is Promise<void> so the action can be passed directly as
  // `<form action={deleteContactAction.bind(null, id)}>` without a client
  // closure wrapper. The wrapper pattern previously used here relied on
  // React's `javascript:throw` form-replay sentinel, which only fires after
  // the row's client component hydrates — a real-browser race condition
  // surfaced post-Phase-4 (click registered, request never sent).
  //
  // Direct-binding emits a real `$ACTION_ID_*` hidden input + `formAction`
  // attribute, so the form is a true server-action POST and never depends
  // on the replay queue. All error/not-found paths must redirect to surface
  // feedback to the caller; returning a value here is no longer observable.
  //
  // `redirect()` throws NEXT_REDIRECT, so it MUST stay outside the try/catch
  // (same constraint as updateContactAction / seedDemoContactsAction).
  let dbError = false;
  try {
    await deleteContact(id);
  } catch (err) {
    // Log server-side only — never expose DB error details to the client (T-03-06).
    console.error('[actions/contacts] deleteContactAction failed:', err);
    dbError = true;
  }

  if (dbError) {
    // Don't revalidate — table state didn't change.
    redirect('/?notice=delete-error');
  }

  // If the row was already gone, treat as success — the user-visible outcome
  // is identical ("contact no longer in the list"). Skipping the previous
  // not-found object-return path keeps redirect() the only exit.
  revalidatePath('/');
  redirect('/?notice=deleted');
}
