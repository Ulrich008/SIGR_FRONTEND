import { z } from 'zod';

export const typeUniteSchema = z.object({
  code: z.string()
    .min(1, "Le code du type d'unité est obligatoire")
    .max(50, "Le code du type d'unité ne doit pas dépasser 50 caractères"),
  libelle: z.string()
    .min(1, "Le libellé du type d'unité est obligatoire")
    .max(200, "Le libellé du type d'unité ne doit pas dépasser 200 caractères"),
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
});
