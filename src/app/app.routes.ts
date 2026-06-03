import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'ministeres',
    loadChildren: () => import('./modules/ministeres/ministeres.module').then(m => m.MinisteresModule)
  },
  {
    path: 'unite-administrative',
    loadChildren: () => import('./modules/unite-administrative/unite-administrative.module').then(m => m.UniteAdministrativeModule)
  },
  {
    path: 'unite-administrative/type-unite',
    loadChildren: () => import('./modules/type-unite/type-unite.module').then(m => m.TypeUniteModule)
  },
  {
    path: 'processus',
    loadChildren: () => import('./modules/processus/processus.module').then(m => m.ProcessusModule)
  },
  {
    path: 'cartographie-risques',
    loadChildren: () => import('./modules/cartographie-risques/cartographie-risques.module').then(m => m.CartographieRisquesModule)
  },
  {
    path: 'risques',
    loadChildren: () => import('./modules/risques/risques.module').then(m => m.RisquesModule)
  },
  {
    path: 'evaluations',
    loadChildren: () => import('./modules/evaluations/evaluations.module').then(m => m.EvaluationsModule)
  },
  {
    path: 'risques-residuels',
    loadChildren: () => import('./modules/risques-residuels/risques-residuels.module').then(m => m.RisquesResiduelsModule)
  },
  {
    path: 'matrices',
    loadChildren: () => import('./modules/matrices/matrices.module').then(m => m.MatricesModule)
  },
  {
    path: 'indicateurs',
    loadChildren: () => import('./modules/indicateurs/indicateurs.module').then(m => m.IndicateursModule)
  },
  {
    path: 'unites-mesure',
    loadChildren: () => import('./modules/unites-mesure/unites-mesure.module').then(m => m.UnitesMesureModule)
  },
  {
    path: 'missions',
    loadChildren: () => import('./modules/missions/missions.module').then(m => m.MissionsModule)
  },
  {
    path: 'plans-mitigation',
    loadChildren: () => import('./modules/plans-mitigation/plans-mitigation.module').then(m => m.PlansMitigationModule)
  },
  {
    path: 'actions',
    loadChildren: () => import('./modules/actions/actions.module').then(m => m.ActionsModule)
  },
  {
    path: 'agents',
    loadChildren: () => import('./modules/agents/agents.module').then(m => m.AgentsModule)
  },
  {
    path: 'agents/affectations',
    loadChildren: () => import('./modules/affectations/affectations.module').then(m => m.AffectationsModule)
  },
   
{
  path: 'profils',
  loadChildren: () =>
    import('./modules/profils/profils.module').then(m => m.ProfilsModule)
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
