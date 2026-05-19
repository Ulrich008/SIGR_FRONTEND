import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

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
      }),
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
    const user = this.getCurrentUser();
    if (!user || !roles || roles.length === 0) return true;
    return roles.includes(user.role);
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