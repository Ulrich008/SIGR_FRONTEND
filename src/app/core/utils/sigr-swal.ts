import Swal from 'sweetalert2';

/**
 * Instance SweetAlert2 brandée SIGR — à importer partout à la place du
 * `Swal` brut de la librairie, pour que toutes les popups (confirmation,
 * succès, erreur) partagent le même cadre visuel (coins arrondis, boutons
 * carrés verts/rouges de la charte SIGR) plutôt que le style par défaut
 * de SweetAlert2 (boutons pilule bleu/violet).
 *
 * Le bouton de confirmation est vert (action normale) par défaut ; pour
 * une action destructive (suppression, rejet...), passer
 * `customClass: sigrSwalButtons('danger')` explicitement dans l'appel
 * `.fire()` pour l'afficher en rouge à la place.
 */

const BASE_BUTTON_CLASS =
  'rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

export function sigrSwalButtons(variant: 'default' | 'danger' = 'default') {
  return {
    confirmButton:
      variant === 'danger'
        ? `${BASE_BUTTON_CLASS} bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-400`
        : `${BASE_BUTTON_CLASS} bg-emerald-700 hover:bg-emerald-600 text-white focus-visible:ring-emerald-400`,
    cancelButton: `${BASE_BUTTON_CLASS} bg-slate-100 hover:bg-slate-200 text-slate-700 focus-visible:ring-slate-300`
  };
}

export const SigrSwal = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: 'rounded-2xl',
    ...sigrSwalButtons('default')
  }
});
