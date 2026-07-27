import { z } from 'zod';

export const profilSchema = z.object({
  code: z.string()
    .min(1, "Le code du profil est obligatoire")
    .max(50, "Le code du profil ne doit pas dépasser 50 caractères")
    .regex(/^[A-Z0-9_-]+$/, "Le code doit être en majuscules, sans espaces (lettres, chiffres, _ ou -)"),
  libelle: z.string()
    .min(1, "Le libellé du profil est obligatoire")
    .max(100, "Le libellé du profil ne doit pas dépasser 100 caractères"),
  description: z.string()
    .max(300, "La description ne doit pas dépasser 300 caractères")
    .optional()
});
