import { z } from 'zod';

export const processusSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé du processus est obligatoire")
    .max(200, "Le libellé du processus ne doit pas dépasser 200 caractères"),
  typeProcessus: z.string()
    .min(1, "Le type de processus est obligatoire"),
  idUnite: z.string()
    .min(1, "L'unité administrative est obligatoire"),
  idProprietaire: z.string()
    .min(1, "Le propriétaire est obligatoire")
});
