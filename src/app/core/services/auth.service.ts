import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ForgotPasswordRequest, LoginRequest, LoginResponse, ResetPasswordRequest } from '../models/auth.model';
import { MenuService } from './menu.service';
import { ChatbotService } from './chatbot.service';

// ✅ ErrorHandlerService retiré — dépendance circulaire supprimée
// AuthService -> ErrorHandlerService -> AuthService causait NG0200

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private chatbotService: ChatbotService,
    @Inject(PLATFORM_ID) platformId: Object
    // ✅ ErrorHandlerService supprimé du constructeur
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    }
  }

  // ================= LOGIN =================
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        this.setSession(response);
        this.currentUserSubject.next(response);
        // Le menu est un singleton partagé : on repart d'un menu replié
        // pour ce nouvel agent, plutôt que de garder l'état déplié
        // laissé par la session précédente.
        this.menuService.resetExpandedState();
        // Conversation propre à chaque agent : on repart de l'accueil du
        // chatbot plutôt que de garder l'historique de la session précédente.
        this.chatbotService.reset();
      }),
      catchError(error => this.handleError(error))
    );
  }

  // ================= MOT DE PASSE OUBLIÉ =================
  motDePasseOublie(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/mot-de-passe-oublie`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  reinitialiserMotDePasse(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reinitialiser-mot-de-passe`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // ================= LOGOUT =================
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.menuService.resetExpandedState();
    this.chatbotService.reset();
  }

  // ================= AUTH CHECK =================
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  // ================= TOKEN =================
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ================= USER =================
  getCurrentUser(): LoginResponse | null {
    if (!this.isBrowser) return null;

    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // ================= ROLE =================
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role) || (!!user.codeProfil && roles.includes(user.codeProfil));
  }

  /** Rôle technique + profil métier de l'utilisateur connecté, pour un filtrage générique par rôle. */
  getCurrentRoles(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return [user.role, user.codeProfil].filter((r): r is string => !!r);
  }

  /**
   * Guide d'utilisation complet de la plateforme : page statique autonome,
   * volontairement ouverte hors du routeur Angular (nouvel onglet). Le
   * Manager Risque, la CCI, le CMMR et le Pilote ont chacun un guide dédié
   * à leur périmètre ; les autres profils (Super Admin, Admin, etc.)
   * conservent le guide général. Centralisé ici pour que le header et
   * l'assistant chatbot pointent toujours vers le même guide, sans risque
   * de désynchronisation.
   *
   * Le Correspondant Risque partage le guide du Manager Risque : mêmes
   * écrans de création/modification (Formalisation, Évaluations,
   * Mitigation), seul le périmètre de données change (sa propre unité
   * administrative plutôt que l'ensemble des processus) — voir la
   * description des profils dans DataInitializer.initProfils() côté
   * backend.
   *
   * Responsable des risques (validation), Responsable d'action, Auditeur
   * et Contrôleur Interne n'ont pas encore de guide dédié — aucun des
   * guides existants ne correspond assez fidèlement à leur périmètre pour
   * être réutilisé sans risque de confusion ; ils retombent donc sur le
   * guide général en attendant leur propre guide.
   */
  getGuideUrl(): string {
    if (this.hasAnyRole(['MANAGER_RISQUE', 'CORRESPONDANT_RISQUE'])) {
      return 'assets/guide/responsable-risque.html';
    }
    if (this.hasAnyRole(['CCI'])) {
      return 'assets/guide/cci.html';
    }
    if (this.hasAnyRole(['CMMR'])) {
      return 'assets/guide/cmmr.html';
    }
    if (this.hasAnyRole(['PILOTE'])) {
      return 'assets/guide/pilote.html';
    }
    return 'assets/guide/index.html';
  }

  // ================= HEADERS =================
  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ================= SESSION =================
  private setSession(response: LoginResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
  }

  // ================= ERROR =================
  // ✅ Gestion inline sans ErrorHandlerService — brise le cycle circulaire
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    switch (error.status) {
      case 0:
        message = 'Erreur réseau. Vérifiez votre connexion.';
        break;
      case 400:
        message = error.error?.message ?? 'Requête invalide.';
        break;
      case 401:
        message = 'Identifiants incorrects.';
        break;
      case 403:
        message = 'Accès refusé.';
        break;
      case 404:
        message = 'Service introuvable.';
        break;
      case 422:
        message = error.error?.message ?? 'Données invalides.';
        break;
      case 500:
        message = 'Erreur serveur. Veuillez réessayer plus tard.';
        break;
      default:
        message = error.error?.message ?? 'Une erreur inattendue est survenue.';
    }

    return throwError(() => ({
      message,
      status: error.status,
      error: error.error
    }));
  }
}