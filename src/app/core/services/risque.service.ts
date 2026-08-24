import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvisHistoriqueResponse, AvisRisqueRequest, RisqueRequest, RisqueResponse } from '../models/risque.model';
import { SuiviRecommandationRequest } from '../models/suivi-recommandation.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RisqueService {
  private readonly apiUrl = `${environment.apiUrl}/api/risques`;

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

  getAll(): Observable<RisqueResponse[]> {
    return this.http.get<RisqueResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<RisqueResponse> {
    return this.http.get<RisqueResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: RisqueRequest): Observable<RisqueResponse> {
    return this.http.post<RisqueResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateByCode(code: string, request: RisqueRequest): Observable<RisqueResponse> {
    return this.http.put<RisqueResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Valider / Différer / Rejeter un risque (CMMR, CCI, Pilote de processus) */
  validerAvis(code: string, request: AvisRisqueRequest): Observable<RisqueResponse> {
    return this.http.patch<RisqueResponse>(`${this.apiUrl}/${code}/avis`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Transmettre un risque au circuit de validation (Responsable des risques) */
  transmettre(code: string): Observable<RisqueResponse> {
    return this.http.patch<RisqueResponse>(`${this.apiUrl}/${code}/transmettre`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Clôturer un risque (réservé au CCI) */
  cloturer(code: string): Observable<RisqueResponse> {
    return this.http.patch<RisqueResponse>(`${this.apiUrl}/${code}/cloturer`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Historique complet des avis de validation (Transmis, Validé, Différé, Rejeté) de ce risque */
  getHistoriqueAvis(code: string): Observable<AvisHistoriqueResponse[]> {
    return this.http.get<AvisHistoriqueResponse[]>(`${this.apiUrl}/${code}/historique-avis`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Suivi des actions de mitigation du risque (statut d'avancement + décision) */
  enregistrerSuivi(code: string, request: SuiviRecommandationRequest): Observable<RisqueResponse> {
    return this.http.patch<RisqueResponse>(`${this.apiUrl}/${code}/suivi`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
