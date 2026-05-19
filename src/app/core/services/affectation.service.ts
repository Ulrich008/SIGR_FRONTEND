import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AffectationRequest, AffectationResponse } from '../models/affectation.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AffectationService {
  private readonly apiUrl = `${environment.apiUrl}/api/affectations`;

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

  getAll(): Observable<AffectationResponse[]> {
    return this.http.get<AffectationResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<AffectationResponse> {
    return this.http.get<AffectationResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: AffectationRequest): Observable<AffectationResponse> {
    return this.http.post<AffectationResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(code: string, request: AffectationRequest): Observable<AffectationResponse> {
    return this.http.put<AffectationResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
