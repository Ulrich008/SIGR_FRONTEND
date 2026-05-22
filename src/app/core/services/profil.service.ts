import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfilRequest, ProfilResponse } from '../models/profil.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private readonly apiUrl = `${environment.apiUrl}/api/profils`;

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

  getAll(): Observable<ProfilResponse[]> {
    return this.http
      .get<ProfilResponse[]>(this.apiUrl, this.headers)
      .pipe(catchError(error => this.handleError(error)));
  }

  getByCode(code: string): Observable<ProfilResponse> {
    return this.http
      .get<ProfilResponse>(`${this.apiUrl}/${code}`, this.headers)
      .pipe(catchError(error => this.handleError(error)));
  }

  create(request: ProfilRequest): Observable<ProfilResponse> {
    return this.http
      .post<ProfilResponse>(this.apiUrl, request, this.headers)
      .pipe(catchError(error => this.handleError(error)));
  }

  update(code: string, request: ProfilRequest): Observable<ProfilResponse> {
    return this.http
      .put<ProfilResponse>(`${this.apiUrl}/${code}`, request, this.headers)
      .pipe(catchError(error => this.handleError(error)));
  }

  delete(code: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${code}`, this.headers)
      .pipe(catchError(error => this.handleError(error)));
  }
}