import { FormGroup } from '@angular/forms';
import { z } from 'zod';

/**
 * Pont entre un schéma Zod et un FormGroup Angular : les règles de
 * validation (obligatoire, longueur, format...) et leurs messages vivent
 * une seule fois dans le schéma Zod, au lieu d'être dupliqués entre
 * Validators Angular + libellés "(optionnel)" + fonctions getFieldError
 * qui finissent par diverger (c'est exactement ce qui a créé des champs
 * obligatoires sans astérisque rouge, et des messages génériques du type
 * "Ce champ est requis" au lieu d'un message propre au champ concerné).
 */

/**
 * Un champ est considéré obligatoire si son schéma refuse `undefined`.
 * Fonctionne quelle que soit la façon dont l'optionalité a été exprimée
 * dans le schéma (.optional(), .default(), .nullish()...) — voir la doc
 * Zod : `schema.safeParse(undefined).success` est la méthode recommandée
 * pour tester l'optionalité, plutôt que d'inspecter les classes internes.
 */
export function isRequired(
  schema: z.ZodObject<any>,
  field: string
): boolean {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const fieldSchema = shape[field];
  if (!fieldSchema) return false;
  return !fieldSchema.safeParse(undefined).success;
}

/**
 * Valide `rawValue` avec le schéma Zod et reporte chaque erreur sur le
 * FormControl correspondant, sous la clé `zod` (message déjà rédigé
 * spécifiquement pour ce champ par le schéma). Les anciennes erreurs
 * `zod` sont effacées avant chaque nouvelle validation ; les autres
 * erreurs déjà présentes sur les contrôles (ex: erreurs serveur) sont
 * préservées.
 */
export function applyZodValidation(
  form: FormGroup,
  schema: z.ZodTypeAny,
  rawValue: unknown
): boolean {
  clearZodErrors(form);

  const result = schema.safeParse(rawValue);
  if (result.success) return true;

  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    const control = form.get(path);
    if (!control) continue;

    const { zod, ...autresErreurs } = control.errors ?? {};
    control.setErrors({ ...autresErreurs, zod: issue.message });
  }

  return false;
}

function clearZodErrors(form: FormGroup): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (!control?.errors?.['zod']) return;

    const { zod, ...autresErreurs } = control.errors;
    control.setErrors(Object.keys(autresErreurs).length ? autresErreurs : null);
  });
}

/** Message d'erreur Zod du champ, uniquement une fois le champ touché. */
export function zodError(form: FormGroup, field: string): string {
  const control = form.get(field);
  if (!control || !control.touched) return '';
  return control.errors?.['zod'] ?? '';
}
