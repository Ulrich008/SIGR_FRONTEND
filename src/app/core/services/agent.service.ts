import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRequest, AgentResponse } from '../models/agent.model';
import { ImportResult } from '../models/import-result.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly apiUrl = `${environment.apiUrl}/api/agents`;

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

  getAll(): Observable<AgentResponse[]> {
    // Le filtrage par ministère est appliqué côté backend (Hibernate filter)
    // pour tous les rôles sauf SUPER_ADMIN : pas besoin de le dupliquer ici.
    return this.http.get<AgentResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getById(id: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/id/${id}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Informations de l'agent actuellement connecté (GET /api/agents/me) */
  getMe(): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/me`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByMatricule(matricule: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/${matricule}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: AgentRequest): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(matricule: string, request: AgentRequest): Observable<AgentResponse> {
    return this.http.put<AgentResponse>(`${this.apiUrl}/${matricule}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  changeStatus(matricule: string, enabled: boolean): Observable<AgentResponse> {
    return this.http.patch<AgentResponse>(`${this.apiUrl}/${matricule}/status?enabled=${enabled}`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Changer mon propre mot de passe (self-service, "Mon profil"). */
  changerMonMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/me/password`, { ancienMotDePasse, nouveauMotDePasse }, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Modifier mon propre email (self-service, "Mon profil"). */
  modifierMonEmail(email: string): Observable<AgentResponse> {
    return this.http.patch<AgentResponse>(`${this.apiUrl}/me/email`, { email }, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(matricule: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${matricule}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * PDF des agents d'un ministère. Un ADMIN reçoit toujours son propre
   * ministère (le paramètre est ignoré côté backend) ; un SUPER_ADMIN
   * doit fournir codeMinistere.
   */
  exportPdf(codeMinistere?: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      headers: this.authService.getAuthHeaders(),
      params: codeMinistere ? { codeMinistere } : undefined,
      responseType: 'blob' as const
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Import en masse d'agents depuis un fichier Excel (.xlsx). */
  importExcel(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** Modèle Excel attendu par importExcel(). */
  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/import/modele`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob' as const
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }
}