import { z } from 'zod';

export const planMitigationSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé du plan de mitigation est obligatoire")
    .max(255, "Le libellé ne doit pas dépasser 255 caractères"),
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional(),
  dateCreation: z.string()
    .min(1, "La date de création est obligatoire"),
  codesRisques: z.array(z.string())
    .min(1, "Au moins un risque associé est obligatoire")
});
