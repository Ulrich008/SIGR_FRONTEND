import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Bloque l'accès à une route dont le profil connecté ne fait pas partie de
 * `data.roles` (même liste de rôles que celle qui conditionne l'affichage
 * du lien correspondant dans MenuService). Suppose que AuthGuard a déjà
 * validé l'authentification avant elle dans le tableau `canActivate` : elle
 * ne s'occupe que de l'autorisation, pas de la connexion.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles = route.data?.['roles'] as string[] | undefined;

    if (!roles || roles.length === 0 || this.authService.hasAnyRole(roles)) {
      return true;
    }

    // Route existante mais non autorisée pour ce profil : on renvoie vers
    // le tableau de bord plutôt que vers /auth/login, l'utilisateur étant
    // bien connecté — seul l'accès à CETTE page lui est refusé.
    return this.router.createUrlTree(['/dashboard']);
  }
}
