import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AvisHistoriqueRapportCIResponse,
  AvisRapportCIRequest,
  RapportControleInterneRequest,
  RapportControleInterneResponse
} from '../models/controle-interne.model';
import { StatutSuiviRequest, DecisionSuiviRequest } from '../models/suivi-recommandation.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RapportControleInterneService {
  private readonly apiUrl = `${environment.apiUrl}/api/rapports-controle-interne`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  private get headers() {
    return { headers: this.authService.getAuthHeaders() };
  }

  private handleError(error: any) {
    const message = this.errorHandler.handleError(error);
    return throwError(() => ({ message, status: error.status }));
  }

  /**
   * Les requêtes avec `responseType: 'blob'` (téléchargement de PDF) reçoivent
   * aussi leurs erreurs sous forme de Blob : le message JSON réel envoyé par
   * le backend (ex. "Le PDF de ce rapport n'a pas encore été généré.") est
   * donc invisible pour ErrorHandlerService, qui retombe sur son message
   * générique "Données invalides...". On relit ici le Blob en texte pour
   * reconstituer une erreur exploitable avant de la transmettre.
   */
  private handleBlobError(error: HttpErrorResponse) {
    if (error.error instanceof Blob && error.error.type === 'application/json') {
      return from(error.error.text()).pipe(
        mergeMap(text => {
          let parsedBody: any = null;
          try { parsedBody = JSON.parse(text); } catch { /* corps non-JSON, ignoré */ }
          return this.handleError(new HttpErrorResponse({
            error: parsedBody,
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url ?? undefined
          }));
        })
      );
    }
    return this.handleError(error);
  }

  getAll(): Observable<RapportControleInterneResponse[]> {
    return this.http.get<RapportControleInterneResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<RapportControleInterneResponse> {
    return this.http.get<RapportControleInterneResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: RapportControleInterneRequest): Observable<RapportControleInterneResponse> {
    return this.http.post<RapportControleInterneResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  genererPdf(code: string): Observable<RapportControleInterneResponse> {
    return this.http.post<RapportControleInterneResponse>(`${this.apiUrl}/${code}/generer-pdf`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  telechargerPdf(code: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${code}/pdf`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob' as const
    }).pipe(
      catchError(error => this.handleBlobError(error))
    );
  }

  transmettre(code: string): Observable<RapportControleInterneResponse> {
    return this.http.post<RapportControleInterneResponse>(`${this.apiUrl}/${code}/transmettre`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  validerAvis(code: string, request: AvisRapportCIRequest): Observable<RapportControleInterneResponse> {
    return this.http.patch<RapportControleInterneResponse>(`${this.apiUrl}/${code}/avis`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  enregistrerStatutSuivi(code: string, request: StatutSuiviRequest): Observable<RapportControleInterneResponse> {
    return this.http.patch<RapportControleInterneResponse>(`${this.apiUrl}/${code}/suivi/statut`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  enregistrerDecisionSuivi(code: string, request: DecisionSuiviRequest): Observable<RapportControleInterneResponse> {
    return this.http.patch<RapportControleInterneResponse>(`${this.apiUrl}/${code}/suivi/decision`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getHistoriqueAvis(code: string): Observable<AvisHistoriqueRapportCIResponse[]> {
    return this.http.get<AvisHistoriqueRapportCIResponse[]>(`${this.apiUrl}/${code}/historique-avis`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
