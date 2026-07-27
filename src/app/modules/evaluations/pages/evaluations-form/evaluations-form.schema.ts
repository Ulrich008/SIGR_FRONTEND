import { z } from 'zod';

export const evaluationBaseSchema = z.object({
  impactInherent: z.coerce.number()
    .min(1, "L'impact inhérent doit être compris entre 1 et 5")
    .max(5, "L'impact inhérent doit être compris entre 1 et 5"),
  probabiliteInherente: z.coerce.number()
    .min(1, "La probabilité inhérente doit être comprise entre 1 et 5")
    .max(5, "La probabilité inhérente doit être comprise entre 1 et 5"),
  protection: z.coerce.number()
    .min(0, "Le niveau de protection doit être compris entre 0 et 3")
    .max(3, "Le niveau de protection doit être compris entre 0 et 3"),
  prevention: z.coerce.number()
    .min(0, "Le niveau de prévention doit être compris entre 0 et 3")
    .max(3, "Le niveau de prévention doit être compris entre 0 et 3"),
  controleExistants: z.string()
    .min(1, "Les bonnes pratiques existantes sont obligatoires"),
  controleInexistants: z.string()
    .min(1, "Les bonnes pratiques inexistantes sont obligatoires"),
  dejaSurvenu: z.boolean().optional(),
  dateDebut: z.string().min(1, "La date de début est obligatoire"),
  dateFin: z.string().min(1, "La date de fin est obligatoire"),
  recommandation: z.string()
    .max(1000, "La recommandation ne doit pas dépasser 1000 caractères")
    .optional(),
  codeRisque: z.string()
    .min(1, "Le risque à évaluer est obligatoire"),
  matriculeAgent: z.string().optional()
});

export const evaluationSchema = evaluationBaseSchema.superRefine((data, ctx) => {
  if (data.dateDebut && data.dateFin && new Date(data.dateFin) <= new Date(data.dateDebut)) {
    ctx.addIssue({
      code: 'custom',
      path: ['dateFin'],
      message: 'La date de fin doit être supérieure à la date de début'
    });
  }

  if (data.protection >= data.impactInherent) {
    ctx.addIssue({
      code: 'custom',
      path: ['protection'],
      message: `La protection doit être inférieure à l'impact inhérent (max autorisé : ${data.impactInherent - 1})`
    });
  }

  if (data.prevention >= data.probabiliteInherente) {
    ctx.addIssue({
      code: 'custom',
      path: ['prevention'],
      message: `La prévention doit être inférieure à la probabilité inhérente (max autorisé : ${data.probabiliteInherente - 1})`
    });
  }
});
