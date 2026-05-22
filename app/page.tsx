// Server Component — reads contacts directly from Postgres via the lib/db.ts
// pool. Each visit re-queries the DB (force-dynamic) so the page reflects the
// current DB state after a PivoCloud restore.

import { listContacts, type Contact } from "@/lib/db/contacts";
import AppHeader from "@/app/_components/AppHeader";
import ContactForm from "@/app/_components/ContactForm";
import ContactRow from "@/app/_components/ContactRow";
import NoticeAutoClose from "@/app/_components/NoticeAutoClose";
import PageHeader from "@/app/_components/PageHeader";
import RefreshButton from "@/app/_components/RefreshButton";
import SeedDemoButton from "@/app/_components/SeedDemoButton";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  let contacts: Contact[] = [];
  let dbError = false;

  try {
    contacts = await listContacts();
  } catch (err) {
    console.error("[/] listContacts failed:", err);
    dbError = true;
  }

  const params = await searchParams;
  const notice = params["notice"] ?? null;

  const displayCount = dbError ? 0 : contacts.length;
  const subtitle = `${displayCount} contact${displayCount > 1 ? "s" : ""}`;

  return (
    <>
      <AppHeader />
      <PageHeader
        title="Contacts"
        subtitle={subtitle}
        rightSlot={
          <>
            <RefreshButton />
            <SeedDemoButton />
          </>
        }
      />
      <main className="mx-auto w-full max-w-4xl px-6 pb-8 pt-2">
        {notice === "updated" && (
          <NoticeAutoClose message="Contact modifié." />
        )}
        {notice === "deleted" && (
          <NoticeAutoClose message="Contact supprimé." />
        )}
        {notice === "delete-error" && (
          <NoticeAutoClose
            variant="error"
            message="Erreur lors de la suppression du contact. Vérifiez la connexion à PostgreSQL puis réessayez."
          />
        )}
        {notice === "seeded" && (
          <NoticeAutoClose message="5 contacts de démo ajoutés." />
        )}
        {/* seed-error : variant error, comportement uniforme avec les autres notices
            (auto-redirect 4s, le message reste lisible le temps de l'écran) — CD discrétion Plan 04-03. */}
        {notice === "seed-error" && (
          <NoticeAutoClose
            variant="error"
            message="Erreur lors de la préparation des contacts de démo. Vérifiez la connexion à PostgreSQL puis réessayez."
          />
        )}

        {!dbError && (
          <section>
            <h3 className="mb-4 text-sm font-medium text-slate-300">Ajouter un contact</h3>
            <ContactForm />
          </section>
        )}

        {dbError ? (
          <section
            role="alert"
            className="rounded-2xl border border-red-400/40 bg-[var(--surface-raised)] p-4 text-slate-200"
          >
            <p className="font-medium">
              Connexion à la base de données indisponible.
            </p>
            <p className="mt-1 text-sm">
              Vérifiez que PostgreSQL tourne et que <code>DATABASE_URL</code> est
              correctement configuré, puis rafraîchissez la page.
            </p>
          </section>
        ) : contacts.length === 0 ? (
          <section className="rounded-2xl border border-white/6 bg-[var(--surface-raised)] py-12 px-6 text-center">
            <p className="text-base text-slate-200">
              Table <code className="font-mono">contacts</code> vide.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Si vous venez de restaurer vers un snapshot vide, c&apos;est attendu. Utilisez &laquo;&nbsp;Préparer démo&nbsp;&raquo; ou le formulaire pour ajouter des contacts.
            </p>
          </section>
        ) : (
          <section>
            <div className="overflow-hidden rounded-2xl border border-white/6 bg-[var(--surface-raised)]">
              {contacts.map((c) => (
                <ContactRow
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  email={c.email}
                  phone={c.phone}
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {contacts.length} contact{contacts.length > 1 ? "s" : ""} affiché
              {contacts.length > 1 ? "s" : ""} (100 max).
            </p>
          </section>
        )}
      </main>
    </>
  );
}
