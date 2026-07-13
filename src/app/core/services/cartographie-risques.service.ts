import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CartographieRisquesRequest, CartographieRisquesResponse } from '../models/cartographie-risques.model';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CartographieRisquesService {
  private readonly apiUrl = `${environment.apiUrl}/api/cartographies`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  private handleError(error: any) {
    const message = this.errorHandler.handleError(error);
    return throwError(() => ({ message, status: error.status }));
  }

  getAll(): Observable<CartographieRisquesResponse[]> {
    return this.http.get<CartographieRisquesResponse[]>(this.apiUrl).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByCode(code: string): Observable<CartographieRisquesResponse> {
    return this.http.get<CartographieRisquesResponse>(`${this.apiUrl}/${code}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: CartographieRisquesRequest): Observable<CartographieRisquesResponse> {
    return this.http.post<CartographieRisquesResponse>(this.apiUrl, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(code: string, request: CartographieRisquesRequest): Observable<CartographieRisquesResponse> {
    return this.http.put<CartographieRisquesResponse>(`${this.apiUrl}/${code}`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  exportExcelByUnite(codeUnite: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel/unite/${codeUnite}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }
}