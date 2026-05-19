import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  },
  // ❌ NE PAS SSR LES ROUTES PROTÉGÉES JWT
  {
    path: 'ministeres/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'ministere/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'ministère/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'unite-administrative/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'processus/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'cartographie-risques/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'risques/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'evaluations/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'risques-residuels/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'matrices/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'indicateurs/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'plans-mitigation/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'actions/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'agents/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'agents/affectations/**',
    renderMode: RenderMode.Client
  },
];