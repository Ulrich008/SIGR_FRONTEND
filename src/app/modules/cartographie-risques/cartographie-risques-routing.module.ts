import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { GESTION_RISQUE_ROLES, GESTION_RISQUE_ROLES_PLUS_CI } from '../../app.routes';
import { CartographieRisquesListComponent } from './pages/cartographie-risques-list/cartographie-risques-list.component';
import { CartographieRisquesFormComponent } from './pages/cartographie-risques-form/cartographie-risques-form.component';
import { CartographieRisquesDetailComponent } from './pages/cartographie-risques-detail/cartographie-risques-detail.component';
import { CartographieDiffereesRejeteesComponent } from '../plans-cartographie/pages/cartographie-differees-rejetees/cartographie-differees-rejetees.component';
import { CartographieValideesComponent } from '../plans-cartographie/pages/cartographie-validees/cartographie-validees.component';

// Le Contrôleur Interne n'a accès qu'à "Cartographie définitive" (route '')
// — le guard partagé au niveau du module parent (app.routes.ts) l'autorise
// déjà à entrer dans ce module ; ici, on referme l'accès aux 3 autres
// sous-routes en les gardant sur la liste de rôles d'origine (sans lui).
const routes: Routes = [
  {
    path: '',
    component: CartographieRisquesListComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI }
  },
  {
    path: 'nouveau',
    component: CartographieRisquesFormComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES }
  },
  // Routes statiques : doivent précéder ':code' pour ne pas être
  // interprétées comme un code métier de cartographie.
  {
    path: 'differees-rejetees',
    component: CartographieDiffereesRejeteesComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES }
  },
  {
    path: 'validees',
    component: CartographieValideesComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES }
  },
  {
    path: ':code/edit',
    component: CartographieRisquesFormComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES }
  },
  {
    path: ':code',
    component: CartographieRisquesDetailComponent,
    canActivate: [RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartographieRisquesRoutingModule {}
