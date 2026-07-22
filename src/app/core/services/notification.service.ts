import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../models/notification.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;

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

  /** Notifications de l'agent connecté, les plus récentes en premier. */
  getAll(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getUnreadCount(): Observable<{ nonLues: number }> {
    return this.http.get<{ nonLues: number }>(`${this.apiUrl}/non-lues/nombre`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getById(id: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}/${id}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  markAsRead(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.apiUrl}/${id}/lu`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/tout-lu`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
