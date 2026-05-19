import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IndicateurPerformanceRequest, IndicateurPerformanceResponse } from '../models/indicateur-performance.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class IndicateurPerformanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/indicateurs-performance`;

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

  getAll(): Observable<IndicateurPerformanceResponse[]> {
    return this.http.get<IndicateurPerformanceResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<IndicateurPerformanceResponse> {
    return this.http.get<IndicateurPerformanceResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: IndicateurPerformanceRequest): Observable<IndicateurPerformanceResponse> {
    return this.http.post<IndicateurPerformanceResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(code: string, request: IndicateurPerformanceRequest): Observable<IndicateurPerformanceResponse> {
    return this.http.put<IndicateurPerformanceResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
