import { z } from 'zod';

export const ministereSchema = z.object({
  code: z.string()
    .min(1, "Le code du ministère est obligatoire")
    .max(50, "Le code du ministère ne doit pas dépasser 50 caractères"),
  nom: z.string()
    .min(1, "Le libellé du ministère est obligatoire")
    .max(200, "Le libellé du ministère ne doit pas dépasser 200 caractères"),
  sigle: z.string()
    .max(20, "Le sigle ne doit pas dépasser 20 caractères")
    .optional(),
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
});
