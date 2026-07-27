import { z } from 'zod';

export const actionBaseSchema = z.object({
  dateDebut: z.string()
    .min(1, "La date de début est obligatoire"),
  dateFin: z.string()
    .min(1, "La date de fin est obligatoire"),
  statut: z.string()
    .min(1, "Le statut est obligatoire"),
  codePlan: z.string()
    .min(1, "Le plan de mitigation est obligatoire"),
  codeRisque: z.string()
    .min(1, "Le risque associé est obligatoire"),
  bonnePratique: z.string()
    .min(1, "La bonne pratique inexistante est obligatoire"),
  matriculeResponsable: z.string()
    .min(1, "Le responsable est obligatoire")
});

export const actionSchema = actionBaseSchema.superRefine((data, ctx) => {
  if (data.dateDebut && data.dateFin && new Date(data.dateFin) < new Date(data.dateDebut)) {
    ctx.addIssue({
      code: 'custom',
      path: ['dateFin'],
      message: 'La date de fin doit être supérieure à la date de début'
    });
  }
});
