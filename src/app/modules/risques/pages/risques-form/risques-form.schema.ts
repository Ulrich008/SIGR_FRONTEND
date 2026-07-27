import { z } from 'zod';

export const risqueSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé du risque est obligatoire")
    .max(200, "Le libellé du risque ne doit pas dépasser 200 caractères"),
  statut: z.string()
    .min(1, "Le statut est obligatoire"),
  dateIdentification: z.string()
    .min(1, "La date d'identification est obligatoire"),
  codeProcessus: z.string()
    .min(1, "Le processus est obligatoire"),
  typeRisque: z.string()
    .min(1, "Le type de risque est obligatoire")
});
