import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
// RESPONSABLE_RISQUES (lecture + visa, sans CRUD) et CORRESPONDANT_RISQUE
// (mêmes droits d'écriture que MANAGER_RISQUE mais cantonné à sa propre UA,
// voir le filtre Hibernate dédié) voient ces mêmes écrans que MANAGER_RISQUE ;
// la distinction lecture/écriture se fait au niveau des canWrite/@PreAuthorize,
// pas ici (ce tableau ne gouverne que la visibilité de la page).
export const GESTION_RISQUE_ROLES = ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'MANAGER_RISQUE', 'RESPONSABLE_RISQUES', 'CORRESPONDANT_RISQUE', 'RESPONSABLE_ACTION', 'AUDITEUR'];
// Mêmes modules que GESTION_RISQUE_ROLES, mais aussi accessibles (en lecture
// seule côté UI) au Contrôleur Interne — sans lui donner Formalisation du
// risque, volontairement absent de cette liste (voir Processus/Risques
// ci-dessous qui restent sur GESTION_RISQUE_ROLES). Exportée pour être
// réutilisée par cartographie-risques-routing.module.ts (restriction fine
// par sous-route : seule "Cartographie définitive" doit l'inclure).
export const GESTION_RISQUE_ROLES_PLUS_CI = [...GESTION_RISQUE_ROLES, 'CONTROLEUR_INTERNE'];
export const AUDIT_ROLES = ['SUPER_ADMIN', 'AUDITEUR', 'PILOTE', 'CCI', 'CMMR', 'CONTROLEUR_INTERNE', 'MANAGER_RISQUE', 'RESPONSABLE_RISQUES', 'CORRESPONDANT_RISQUE'];
export const PROJET_CARTOGRAPHIE_ROLES = ['SUPER_ADMIN', 'MANAGER_RISQUE', 'PILOTE', 'CCI', 'CMMR', 'RESPONSABLE_RISQUES', 'CORRESPONDANT_RISQUE'];
export const CONTROLE_INTERNE_ROLES = ['SUPER_ADMIN', 'CONTROLEUR_INTERNE'];
export const RAPPORT_CI_ROLES = ['SUPER_ADMIN', 'CCI', 'RESPONSABLE_RISQUES', 'CMMR'];
// "Suivi des recommandations" (menu transverse du document de référence) :
// seuls le Contrôleur Interne (statut d'avancement) et la CCI (décision)
// y ont accès — plus restreint que GESTION_RISQUE_ROLES_PLUS_CI.
export const SUIVI_RECOMMANDATIONS_CI_ROLES = ['SUPER_ADMIN', 'CONTROLEUR_INTERNE', 'CCI'];

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'me',
    canActivate: [AuthGuard],
    loadComponent: () => import('./modules/me/me.component').then(c => c.MeComponent)
  },
  {
    path: 'ministeres',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/ministeres/ministeres.module').then(m => m.MinisteresModule)
  },
  {
    path: 'unite-administrative',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/unite-administrative/unite-administrative.module').then(m => m.UniteAdministrativeModule)
  },
  {
    path: 'unite-administrative/type-unite',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/type-unite/type-unite.module').then(m => m.TypeUniteModule)
  },
  {
    path: 'processus',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/processus/processus.module').then(m => m.ProcessusModule)
  },
  {
    path: 'plans-cartographie',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: PROJET_CARTOGRAPHIE_ROLES },
    loadComponent: () => import('./modules/plans-cartographie/pages/plans-cartographie-list/plans-cartographie-list.component').then(c => c.PlansCartographieListComponent)
  },
  {
    path: 'cartographie-risques',
    canActivate: [AuthGuard, RoleGuard],
    // Le Contrôleur Interne n'a accès qu'à "Cartographie définitive" : la
    // restriction fine par sous-route est faite dans
    // cartographie-risques-routing.module.ts (guard par route enfant).
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/cartographie-risques/cartographie-risques.module').then(m => m.CartographieRisquesModule)
  },
  {
    path: 'risques',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/risques/risques.module').then(m => m.RisquesModule)
  },
  {
    path: 'evaluations',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/evaluations/evaluations.module').then(m => m.EvaluationsModule)
  },
  {
    path: 'matrices',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/matrices/matrices.module').then(m => m.MatricesModule)
  },
  {
    path: 'indicateurs',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/indicateurs/indicateurs.module').then(m => m.IndicateursModule)
  },
  {
    path: 'unites-mesure',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/unites-mesure/unites-mesure.module').then(m => m.UnitesMesureModule)
  },
  {
    path: 'suivi-risques',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadComponent: () => import('./modules/suivi-risques/pages/suivi-risques-list/suivi-risques-list.component').then(c => c.SuiviRisquesListComponent)
  },
  {
    path: 'suivi-risques/recommandations-ci',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: SUIVI_RECOMMANDATIONS_CI_ROLES },
    loadComponent: () => import('./modules/suivi-risques/pages/suivi-recommandations-ci/suivi-recommandations-ci.component').then(c => c.SuiviRecommandationsCiComponent)
  },
  {
    path: 'suivi-risques/recommandations-ci/:code',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: SUIVI_RECOMMANDATIONS_CI_ROLES },
    loadComponent: () => import('./modules/suivi-risques/pages/suivi-recommandations-ci-detail/suivi-recommandations-ci-detail.component').then(c => c.SuiviRecommandationsCiDetailComponent)
  },
  {
    path: 'suivi-risques/recommandations-audit',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadComponent: () => import('./modules/suivi-risques/pages/suivi-recommandations-audit/suivi-recommandations-audit.component').then(c => c.SuiviRecommandationsAuditComponent)
  },
  {
    // Page de détail dédiée au suivi d'un risque (distincte de /risques/:code
    // qui est la fiche de formalisation) : doit rester APRÈS les routes
    // littérales ci-dessus (recommandations-ci/-audit), sans quoi ':code'
    // les intercepterait en premier.
    path: 'suivi-risques/:code',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadComponent: () => import('./modules/suivi-risques/pages/suivi-risques-detail/suivi-risques-detail.component').then(c => c.SuiviRisquesDetailComponent)
  },
  {
    path: 'plans-mitigation',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/plans-mitigation/plans-mitigation.module').then(m => m.PlansMitigationModule)
  },
  {
    path: 'actions',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES_PLUS_CI },
    loadChildren: () => import('./modules/actions/actions.module').then(m => m.ActionsModule)
  },
  {
    path: 'agents',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/agents/agents.module').then(m => m.AgentsModule)
  },
  {
    path: 'agents/affectations',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/affectations/affectations.module').then(m => m.AffectationsModule)
  },
  {
    path: 'profils',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () =>
      import('./modules/profils/profils.module').then(m => m.ProfilsModule)
  },
  {
    path: 'alertes',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/alertes/alertes.module').then(m => m.AlertesModule)
  },
  {
    path: 'plans-audit',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: AUDIT_ROLES },
    loadComponent: () => import('./modules/plans-audit/pages/plan-audit-list/plan-audit-list.component').then(c => c.PlanAuditListComponent)
  },
  {
    path: 'plans-audit/new',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: AUDIT_ROLES },
    loadComponent: () => import('./modules/plans-audit/pages/plan-audit-form/plan-audit-form.component').then(c => c.PlanAuditFormComponent)
  },
  {
    path: 'plans-audit/:code',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: AUDIT_ROLES },
    loadComponent: () => import('./modules/plans-audit/pages/plan-audit-form/plan-audit-form.component').then(c => c.PlanAuditFormComponent)
  },
  {
    path: 'controle-interne/controles-second-niveau',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/controle-second-niveau-list/controle-second-niveau-list.component').then(c => c.ControleSecondNiveauListComponent)
  },
  {
    path: 'controle-interne/controles-second-niveau/nouveau',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/controle-second-niveau-form/controle-second-niveau-form.component').then(c => c.ControleSecondNiveauFormComponent)
  },
  {
    path: 'controle-interne/controles-second-niveau/:code',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/controle-second-niveau-form/controle-second-niveau-form.component').then(c => c.ControleSecondNiveauFormComponent)
  },
  {
    path: 'controle-interne/rapports',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/rapport-list/rapport-list.component').then(c => c.RapportListComponent)
  },
  {
    path: 'controle-interne/rapports/nouveau',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/rapport-form/rapport-form.component').then(c => c.RapportFormComponent)
  },
  {
    path: 'controle-interne/rapports/:code',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/rapport-detail/rapport-detail.component').then(c => c.RapportDetailComponent)
  },
  {
    path: 'controle-interne/rapports/:code/historique-avis',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/rapport-historique-avis/rapport-historique-avis.component').then(c => c.RapportHistoriqueAvisComponent)
  },
  {
    path: 'controle-interne/transmission',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: CONTROLE_INTERNE_ROLES },
    loadComponent: () => import('./modules/controle-interne/pages/transmission-list/transmission-list.component').then(c => c.TransmissionListComponent)
  },
  {
    path: 'rapport-ci',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: RAPPORT_CI_ROLES },
    loadComponent: () => import('./modules/rapport-ci/pages/rapport-ci-list/rapport-ci-list.component').then(c => c.RapportCiListComponent)
  },
  {
    path: 'ministere',
    redirectTo: '/ministeres',
    pathMatch: 'full'
  },
  {
    path: 'ministère',
    redirectTo: '/ministeres',
    pathMatch: 'full'
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
