import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConstatsRecommandationsResponse,
  ControleSecondNiveauRequest,
  ControleSecondNiveauResponse,
  LigneControleResponse
} from '../models/controle-interne.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ControleSecondNiveauService {
  private readonly apiUrl = `${environment.apiUrl}/api/controles-second-niveau`;

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

  getAll(): Observable<ControleSecondNiveauResponse[]> {
    return this.http.get<ControleSecondNiveauResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<ControleSecondNiveauResponse> {
    return this.http.get<ControleSecondNiveauResponse>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: ControleSecondNiveauRequest): Observable<ControleSecondNiveauResponse> {
    return this.http.post<ControleSecondNiveauResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateByCode(code: string, request: ControleSecondNiveauRequest): Observable<ControleSecondNiveauResponse> {
    return this.http.put<ControleSecondNiveauResponse>(`${this.apiUrl}/${code}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getConstatsEtRecommandations(codeUnite: string, codeProcessus: string): Observable<ConstatsRecommandationsResponse> {
    const params = new URLSearchParams({ codeUnite, codeProcessus }).toString();
    return this.http.get<ConstatsRecommandationsResponse>(`${this.apiUrl}/constats-recommandations?${params}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getLignesDetaillees(codeUnite: string, codeProcessus: string): Observable<LigneControleResponse[]> {
    const params = new URLSearchParams({ codeUnite, codeProcessus }).toString();
    return this.http.get<LigneControleResponse[]>(`${this.apiUrl}/lignes?${params}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
