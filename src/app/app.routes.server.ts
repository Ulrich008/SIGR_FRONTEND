import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'ministeres/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'ministere/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'ministère/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
