import { z } from 'zod';

export const affectationSchema = z.object({
  code: z.string()
    .min(1, "Le code de l'affectation est obligatoire")
    .max(50, "Le code de l'affectation ne doit pas dépasser 50 caractères"),
  matriculeAgent: z.string()
    .min(1, "L'agent est obligatoire"),
  codeUnite: z.string()
    .min(1, "L'unité administrative est obligatoire"),
  poste: z.string()
    .min(1, "Le poste est obligatoire")
    .max(100, "Le poste ne doit pas dépasser 100 caractères"),
  dateAffectation: z.string()
    .min(1, "La date d'affectation est obligatoire"),
  dateFinAffectation: z.string()
    .min(1, "La date de fin d'affectation est obligatoire")
});
