import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MinistereRequest, MinistereResponse } from '../models/ministere.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class MinistereService {
  private readonly apiUrl = `${environment.apiUrl}/api/ministeres`;

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

  getAll(): Observable<MinistereResponse[]> {
    return this.http.get<MinistereResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getById(id: string): Observable<MinistereResponse> {
    return this.http.get<MinistereResponse>(`${this.apiUrl}/${id}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.post<MinistereResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(id: string, request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.put<MinistereResponse>(`${this.apiUrl}/${id}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}