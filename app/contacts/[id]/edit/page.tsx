// Server Component — dynamic route for editing an existing contact.
// Fetches contact from Postgres, renders ContactForm in update mode.
// force-dynamic ensures the restore-style scenario is visible without rebuild.

import { notFound } from 'next/navigation';
import { getContactById } from '@/lib/db/contacts';
import { updateContactAction } from '@/app/actions/contacts';
import AppHeader from '@/app/_components/AppHeader';
import ContactForm from '@/app/_components/ContactForm';
import PageHeader from '@/app/_components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let contact = null;
  try {
    contact = await getContactById(id);
  } catch (err) {
    // Catches invalid UUID syntax errors thrown by pg ("invalid input syntax for type uuid").
    console.error('[/contacts/[id]/edit] getContactById failed:', err);
    notFound();
  }

  if (contact === null) {
    notFound();
  }

  // Bind the id into the action for use with useActionState.
  const boundAction = updateContactAction.bind(null, id);

  return (
    <>
      <AppHeader />
      <PageHeader title="Modifier le contact" />
      <main className="mx-auto w-full max-w-4xl px-6 pb-8 pt-2">
        {/* Pass only the 4 necessary fields — do NOT expose created_at to the client (T-03-07 mitigation). */}
        <ContactForm
          initialContact={{
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
          }}
          action={boundAction}
          submitLabel="Enregistrer"
        />
      </main>
    </>
  );
}
