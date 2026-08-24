import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanAuditRequest, PlanAuditResponse } from '../models/audit.model';
import { SuiviRecommandationRequest } from '../models/suivi-recommandation.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PlanAuditService {
  private readonly apiUrl = `${environment.apiUrl}/api/plans-audit`;

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

  getAll(): Observable<PlanAuditResponse[]> {
    return this.http.get<PlanAuditResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<PlanAuditResponse> {
    return this.http.get<PlanAuditResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: PlanAuditRequest): Observable<PlanAuditResponse> {
    return this.http.post<PlanAuditResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateByCode(code: string, request: PlanAuditRequest): Observable<PlanAuditResponse> {
    return this.http.put<PlanAuditResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getAuditProposeEnums(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/enums/audit-propose`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getTypeRevueEnums(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/enums/type-revue`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  enregistrerSuivi(code: string, request: SuiviRecommandationRequest): Observable<PlanAuditResponse> {
    return this.http.patch<PlanAuditResponse>(`${this.apiUrl}/${code}/suivi`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
