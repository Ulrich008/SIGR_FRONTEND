import { z } from 'zod';

export const uniteAdministrativeSchema = z.object({
  code: z.string()
    .min(1, "Le sigle de l'unité administrative est obligatoire")
    .max(50, "Le sigle ne doit pas dépasser 50 caractères"),
  libelle: z.string()
    .min(1, "Le libellé de l'unité administrative est obligatoire")
    .max(200, "Le libellé ne doit pas dépasser 200 caractères"),
  idTypeUnite: z.string()
    .min(1, "Le type d'unité est obligatoire"),
  codeMinistere: z.string()
    .min(1, "Le ministère de rattachement est obligatoire"),
  idUniteParent: z.string().optional(),
  niveauHierarchique: z.number()
    .min(1, "Le niveau hiérarchique doit être au moins 1")
    .max(10, "Le niveau hiérarchique ne doit pas dépasser 10")
});
