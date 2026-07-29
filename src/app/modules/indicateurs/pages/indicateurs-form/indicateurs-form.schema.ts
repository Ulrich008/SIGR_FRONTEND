import { z } from 'zod';

export const indicateurBaseSchema = z.object({
  libelle: z.string()
    .min(1, "Le libellé de l'indicateur est obligatoire")
    .max(200, "Le libellé de l'indicateur ne doit pas dépasser 200 caractères"),
  frequence: z.string()
    .min(1, "La fréquence est obligatoire"),
  valeurCible: z.coerce.string().optional(),
  valeurObtenue: z.coerce.string().optional(),
  seuilAlerte: z.string().optional(),
  codeUniteMesure: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  codeProcessus: z.string()
    .min(1, "Le processus est obligatoire"),
  codeRisque: z.string().optional(),
  codePlanMitigation: z.string().optional(),
  codeAction: z.string().optional()
});

export const indicateurSchema = indicateurBaseSchema.superRefine((data, ctx) => {
  if (!data.valeurCible || !data.valeurObtenue) return;

  const cible = parseFloat(data.valeurCible);
  const obtenue = parseFloat(data.valeurObtenue);

  if (!isNaN(cible) && !isNaN(obtenue) && obtenue > cible) {
    ctx.addIssue({
      code: 'custom',
      path: ['valeurObtenue'],
      message: 'La valeur obtenue ne peut pas être supérieure à la valeur cible'
    });
  }
});
