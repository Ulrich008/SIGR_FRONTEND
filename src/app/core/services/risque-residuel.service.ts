import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RisqueResiduelRequest, RisqueResiduelResponse } from '../models/risque-residuel.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RisqueResiduelService {
  private readonly apiUrl = `${environment.apiUrl}/api/risques-residuels`;

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

  getAll(): Observable<RisqueResiduelResponse[]> {
    return this.http.get<RisqueResiduelResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<RisqueResiduelResponse> {
    return this.http.get<RisqueResiduelResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByEvaluation(codeEvaluation: string): Observable<RisqueResiduelResponse[]> {
    return this.http.get<RisqueResiduelResponse[]>(`${this.apiUrl}/evaluation/${codeEvaluation}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByRisque(codeRisque: string): Observable<RisqueResiduelResponse[]> {
    return this.http.get<RisqueResiduelResponse[]>(`${this.apiUrl}/risque/${codeRisque}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getRisquesEleves(): Observable<RisqueResiduelResponse[]> {
    return this.http.get<RisqueResiduelResponse[]>(`${this.apiUrl}/eleves`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: RisqueResiduelRequest): Observable<RisqueResiduelResponse> {
    return this.http.post<RisqueResiduelResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateByCode(code: string, request: RisqueResiduelRequest): Observable<RisqueResiduelResponse> {
    return this.http.put<RisqueResiduelResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
