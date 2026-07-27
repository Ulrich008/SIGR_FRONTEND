import { z } from 'zod';

export const cartographieRisquesSchema = z.object({
  titre: z.string()
    .min(1, "Le titre de la cartographie est obligatoire")
    .max(200, "Le titre ne doit pas dépasser 200 caractères"),
  periode: z.string()
    .min(1, "La période est obligatoire"),
  seuilFaible: z.coerce.number()
    .min(0, "Le seuil faible ne peut pas être négatif"),
  seuilMoyen: z.coerce.number()
    .min(0, "Le seuil moyen ne peut pas être négatif"),
  seuilEleve: z.coerce.number()
    .min(0, "Le seuil élevé ne peut pas être négatif"),
  statut: z.string()
    .min(1, "Le statut est obligatoire"),
  codeUniteAdministrative: z.string()
    .min(1, "L'unité administrative est obligatoire")
});
