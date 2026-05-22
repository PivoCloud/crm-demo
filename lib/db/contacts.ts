// Repository for the contacts table.
// Phase 1 ships listContacts; Phase 2 Plan 02 adds createContact.
// Phase 2 Plan 03 adds getContactById, updateContact, deleteContact.
//
// Phase 1 / Plan 01 / Task 3 — Walking Skeleton.
// Phase 2 / Plan 02 / Task 2 — createContact added.
// Phase 2 / Plan 03 / Task 1 — getContactById, updateContact, deleteContact added.

import { query } from "@/lib/db";
import { ensureSchema } from "@/lib/db/bootstrap";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: Date;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: Date;
};

/**
 * Explicit whitelist of columns accepted by create/update operations.
 * Never spread raw user input — prevents mass-assignment (T-02-04).
 */
export type CreateContactInput = {
  name: string;
  email: string;
  phone: string | null;
};

/**
 * Shared type for update: same mutable columns as create (PUT-style, not PATCH).
 * Used by Plan 03 updateContact.
 */
export type UpdateContactInput = CreateContactInput;

/**
 * Return the most recent 100 contacts, newest first.
 * Bootstraps the schema on first call.
 */
export async function listContacts(): Promise<Contact[]> {
  await ensureSchema();
  const rows = await query<ContactRow>(
    `SELECT id, name, email, phone, created_at
       FROM contacts
       ORDER BY created_at DESC
       LIMIT 100`,
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    created_at: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
  }));
}

/**
 * Return a single contact by its UUID primary key.
 * Returns null if no row matches (never throws on not-found).
 * Throws on malformed UUID — the caller is responsible for catching (T-03-01).
 */
export async function getContactById(id: string): Promise<Contact | null> {
  await ensureSchema();
  const rows = await query<ContactRow>(
    'SELECT id, name, email, phone, created_at FROM contacts WHERE id = $1',
    [id],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    created_at: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
  };
}

/**
 * Update name/email/phone for a contact.
 * Returns the updated Contact, or null if the id was not found (T-03-05: WHERE id = $1 obligatoire).
 * Never interpolates user input — all fields passed as positional params (T-03-01).
 */
export async function updateContact(id: string, input: UpdateContactInput): Promise<Contact | null> {
  await ensureSchema();
  // Whitelist columns explicitly — never spread input.
  const { name, email, phone } = input;
  const rows = await query<ContactRow>(
    'UPDATE contacts SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone, created_at',
    [name, email, phone, id],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    created_at: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
  };
}

/**
 * Delete a contact by its UUID primary key.
 * Returns true if the row was deleted, false if no row matched (T-03-05: WHERE id = $1 obligatoire).
 * Uses RETURNING id to avoid importing getPool — keeps import surface minimal.
 */
export async function deleteContact(id: string): Promise<boolean> {
  await ensureSchema();
  // Use RETURNING id to count affected rows without importing getPool.
  const rows = await query<{ id: string }>(
    'DELETE FROM contacts WHERE id = $1 RETURNING id',
    [id],
  );
  return rows.length > 0;
}

/**
 * Idempotent seed of the 5 DZ demo contacts (D-19).
 * Returns 5 if the table was empty and rows were inserted, 0 otherwise.
 * Hardcoded values — still uses positional params for consistency with the
 * repository's no-interpolation rule (T-02-01).
 */
export async function bulkInsertIfEmpty(): Promise<number> {
  await ensureSchema();

  const countRows = await query<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM contacts',
  );
  const current = countRows[0]?.count ?? 0;
  if (current > 0) return 0;

  await query(
    `INSERT INTO contacts (name, email, phone) VALUES
       ($1,  $2,  $3),
       ($4,  $5,  $6),
       ($7,  $8,  $9),
       ($10, $11, $12),
       ($13, $14, $15)`,
    [
      'Sara Bouchama',   'sara@medtechdz.dz',          '+213 555 12 34 56',
      'Yacine Belkacem', 'yacine@logipay.dz',          '+213 661 98 76 54',
      'Amina Hamidi',    'amina@startup-incubator.dz', '+213 770 22 33 44',
      'Karim Saidi',     'karim@devshop.dz',           '+213 540 11 22 33',
      'Nadia Mokrani',   'nadia@cloud-dz.dz',          '+213 661 55 44 33',
    ],
  );

  return 5;
}

/**
 * Insert a new contact and return the created row.
 * Uses positional parameters only — never interpolates user input (T-02-01 SQL injection mitigation).
 */
export async function createContact(input: CreateContactInput): Promise<Contact> {
  await ensureSchema();

  // Whitelist columns explicitly — do NOT spread input or use Object.values.
  const { name, email, phone } = input;

  const rows = await query<ContactRow>(
    `INSERT INTO contacts (name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, phone, created_at`,
    [name, email, phone],
  );

  if (rows.length === 0) {
    throw new Error("createContact: insert returned no row");
  }

  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    created_at: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
  };
}
