import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private authService: AuthService) {}

  handleError(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      return `Erreur client: ${error.error.message}`;
    }

    // Erreur côté serveur
    if (error.status === 0) {
      return 'Serveur inaccessible. Veuillez vérifier votre connexion.';
    }

    if (error.status === 400) {
      const message = this.extractMessage(error);
      return message || 'Données invalides. Veuillez vérifier vos informations.';
    }

    if (error.status === 401) {
      return 'Non autorisé. Veuillez vous reconnecter.';
    }

    if (error.status === 403) {
      const message = this.extractMessage(error);
      const currentUser = this.authService.getCurrentUser();
      const role = currentUser?.role || 'utilisateur';
      return message || `Vous êtes ${role}, vous n'avez pas accès à cette section.`;
    }

    if (error.status === 404) {
      return 'Ressource non trouvée.';
    }

    if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    // Erreur générique
    const message = this.extractMessage(error);
    return message || `Erreur ${error.status}: ${error.statusText}`;
  }

  private extractMessage(error: HttpErrorResponse): string | null {
    if (error.error) {
      if (typeof error.error === 'string') {
        try {
          const parsed = JSON.parse(error.error);
          return parsed.message || parsed.error || null;
        } catch {
          return error.error;
        }
      }
      if (error.error.message) {
        // Si le message contient "Access Denied", on le remplace par notre format
        if (error.error.message === 'Access Denied') {
          const currentUser = this.authService.getCurrentUser();
          const role = currentUser?.role || 'utilisateur';
          return `Vous êtes ${role}, vous n'avez pas accès à cette section.`;
        }
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
    }
    return null;
  }
}
