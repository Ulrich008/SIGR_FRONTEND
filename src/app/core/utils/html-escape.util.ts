/**
 * Échappe les caractères HTML spéciaux avant insertion dans un template
 * SweetAlert (option `html:`), qui n'est pas passé par le sanitizer Angular
 * et exécute donc tout balisage tel quel — indispensable dès qu'une valeur
 * interpolée provient d'une saisie utilisateur (libellé, description, message
 * d'erreur d'import, etc.), sous peine d'exécution de script arbitraire.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
