import { z } from 'zod';

const NOM_PATTERN = /^[a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s\-']+$/;

/**
 * Champs communs à la création et à la modification d'un agent. Exporté
 * séparément (sans superRefine) pour permettre l'introspection
 * (isRequired) par simple lecture de schema.shape.
 */
export const agentBaseSchema = z.object({
  npi: z.string()
    .min(1, "Le NPI est obligatoire")
    .regex(/^\d{10}$/, "Le NPI doit contenir exactement 10 chiffres, sans lettre"),
  email: z.string()
    .max(150, "L'email ne doit pas dépasser 150 caractères")
    .refine(v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Adresse email invalide")
    .optional(),
  nom: z.string()
    .min(1, "Le nom est obligatoire")
    .max(50, "Le nom ne doit pas dépasser 50 caractères")
    .regex(NOM_PATTERN, "Caractères spéciaux non autorisés dans le nom"),
  prenoms: z.string()
    .min(1, "Les prénoms sont obligatoires")
    .max(100, "Les prénoms ne doivent pas dépasser 100 caractères")
    .regex(NOM_PATTERN, "Caractères spéciaux non autorisés dans les prénoms"),
  sexe: z.string().min(1, "Le sexe est obligatoire"),
  role: z.string().min(1, "Le rôle est obligatoire"),
  codeProfil: z.string().optional(),
  dateNaissance: z.string().min(1, "La date de naissance est obligatoire"),
  datePriseService: z.string().min(1, "La date de prise de service est obligatoire"),
  codeMinistere: z.string().min(1, "Le ministère est obligatoire"),
  codeUnite: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
});

/**
 * Règles qui dépendent d'un état extérieur au schéma lui-même (mode
 * édition, rôle sélectionné) : mot de passe obligatoire uniquement à la
 * création, unité/profil obligatoires uniquement pour le rôle AGENT,
 * confirmation qui doit correspondre au mot de passe.
 */
export function agentSchema(isEditMode: boolean) {
  return agentBaseSchema.superRefine((data, ctx) => {
    if (data.role === 'AGENT' && !data.codeUnite) {
      ctx.addIssue({
        code: 'custom',
        path: ['codeUnite'],
        message: "L'unité administrative est obligatoire pour un agent"
      });
    }

    if (data.role === 'AGENT' && !data.codeProfil) {
      ctx.addIssue({
        code: 'custom',
        path: ['codeProfil'],
        message: 'Le profil métier est obligatoire pour un agent'
      });
    }

    if (!isEditMode && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    if (isEditMode && data.password && data.password.length > 0 && data.password.length < 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    if (!isEditMode && !data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Veuillez confirmer le mot de passe'
      });
    }

    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Les mots de passe ne correspondent pas'
      });
    }
  });
}
