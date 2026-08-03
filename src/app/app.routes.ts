import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const GESTION_RISQUE_ROLES = ['SUPER_ADMIN', 'CMMR', 'CCI', 'PILOTE', 'RESPONSABLE_RISQUES', 'RESPONSABLE_ACTION', 'AUDITEUR'];
const AUDIT_ROLES = ['SUPER_ADMIN', 'AUDITEUR', 'PILOTE', 'CCI', 'CMMR'];
const PROJET_CARTOGRAPHIE_ROLES = ['SUPER_ADMIN', 'RESPONSABLE_RISQUES', 'PILOTE', 'CCI', 'CMMR'];

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
    data: { roles: GESTION_RISQUE_ROLES },
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
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/evaluations/evaluations.module').then(m => m.EvaluationsModule)
  },
  {
    path: 'matrices',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/matrices/matrices.module').then(m => m.MatricesModule)
  },
  {
    path: 'indicateurs',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/indicateurs/indicateurs.module').then(m => m.IndicateursModule)
  },
  {
    path: 'unites-mesure',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () => import('./modules/unites-mesure/unites-mesure.module').then(m => m.UnitesMesureModule)
  },
  {
    path: 'plans-mitigation',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
    loadChildren: () => import('./modules/plans-mitigation/plans-mitigation.module').then(m => m.PlansMitigationModule)
  },
  {
    path: 'actions',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: GESTION_RISQUE_ROLES },
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
