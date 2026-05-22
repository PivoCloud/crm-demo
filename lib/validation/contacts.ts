// Server-only validation schemas. Do NOT import from client components.
//
// Phase 2 / Plan 02 / Task 1 — CRUD complet.

import { z } from "zod";

export const ContactCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Le nom est requis")
      .max(100, "Le nom doit faire au plus 100 caractères"),
    email: z
      .string()
      .trim()
      .min(1, "L'email est requis")
      .max(200, "L'email doit faire au plus 200 caractères")
      .email("Format d'email invalide"),
    phone: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z
        .string()
        .trim()
        .max(30, "Le téléphone doit faire au plus 30 caractères")
        .nullable(),
    ),
  })
  .strict();

export const ContactUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Le nom est requis")
      .max(100, "Le nom doit faire au plus 100 caractères"),
    email: z
      .string()
      .trim()
      .min(1, "L'email est requis")
      .max(200, "L'email doit faire au plus 200 caractères")
      .email("Format d'email invalide"),
    phone: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z
        .string()
        .trim()
        .max(30, "Le téléphone doit faire au plus 30 caractères")
        .nullable(),
    ),
  })
  .strict();

export type ContactCreateInput = z.infer<typeof ContactCreateSchema>;
export type ContactUpdateInput = z.infer<typeof ContactUpdateSchema>;
