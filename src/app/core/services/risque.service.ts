import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RisqueRequest, RisqueResponse } from '../models/risque.model';
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

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
