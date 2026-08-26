import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          // "Se souvenir de moi" décoché : le token vit dans sessionStorage
          // (vidé à la fermeture de l'onglet) plutôt que localStorage —
          // voir AuthService.setSession().
          const token = sessionStorage.getItem('auth_token') ?? localStorage.getItem('auth_token');
          if (token) {
            req = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            });
          }
          return next(req);
        }
      ])
    )
  ]
};