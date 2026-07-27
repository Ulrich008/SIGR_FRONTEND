import { z } from 'zod';

export const uniteMesureSchema = z.object({
  code: z.string()
    .min(1, "Le code de l'unité de mesure est obligatoire")
    .max(20, "Le code de l'unité de mesure ne doit pas dépasser 20 caractères"),
  libelle: z.string()
    .min(1, "Le libellé de l'unité de mesure est obligatoire")
    .max(200, "Le libellé de l'unité de mesure ne doit pas dépasser 200 caractères"),
  symbole: z.string()
    .max(10, "Le symbole ne doit pas dépasser 10 caractères")
    .optional(),
  description: z.string()
    .max(500, "La description ne doit pas dépasser 500 caractères")
    .optional()
});
