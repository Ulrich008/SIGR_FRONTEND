import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeUniteRequest, TypeUniteResponse } from '../models/type-unite.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TypeUniteService {
  private readonly apiUrl = `${environment.apiUrl}/api/typeunite`;

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

  getAll(): Observable<TypeUniteResponse[]> {
    return this.http.get<TypeUniteResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<TypeUniteResponse> {
    return this.http.get<TypeUniteResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: TypeUniteRequest): Observable<TypeUniteResponse> {
    return this.http.post<TypeUniteResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(code: string, request: TypeUniteRequest): Observable<TypeUniteResponse> {
    return this.http.put<TypeUniteResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
