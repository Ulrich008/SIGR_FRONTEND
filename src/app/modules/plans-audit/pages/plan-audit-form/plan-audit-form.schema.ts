import { z } from 'zod';

export const planAuditSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé du plan d'audit est obligatoire")
    .max(200, "Le libellé du plan d'audit ne doit pas dépasser 200 caractères"),
  dateCreation: z.string()
    .min(1, "La date de création est obligatoire"),
  codeUniteAdministrative: z.string()
    .min(1, "L'unité administrative est obligatoire"),
  codeProcessus: z.string()
    .min(1, "Le processus est obligatoire"),
  codeRisque: z.string().optional(),
  auditPropose: z.string()
    .min(1, "Le type d'audit proposé est obligatoire"),
  typeRevue: z.string()
    .min(1, "Le type de revue est obligatoire"),
  objectifAudit: z.string()
    .min(1, "L'objectif d'audit est obligatoire")
    .max(1000, "L'objectif d'audit ne doit pas dépasser 1000 caractères"),
  effetAuditIndicatif: z.string()
    .min(1, "L'effort d'audit indicatif est obligatoire")
    .max(1000, "L'effort d'audit indicatif ne doit pas dépasser 1000 caractères")
});
