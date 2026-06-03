import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRequest, AgentResponse } from '../models/agent.model';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly apiUrl = `${environment.apiUrl}/api/agents`;

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

  getAll(): Observable<AgentResponse[]> {
    return this.http.get<AgentResponse[]>(this.apiUrl, this.headers).pipe(
      map(agents => {
        const currentUser = this.authService.getCurrentUser();
        // Si l'utilisateur est MANAGER, filtrer les agents de son ministère
        if (currentUser && currentUser.role === 'MANAGER' && currentUser.codeMinistere) {
          return agents.filter(agent => agent.codeMinistere === currentUser.codeMinistere);
        }
        // ADMIN voit tous les agents
        return agents;
      }),
      catchError(error => this.handleError(error))
    );
  }

  getById(id: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/id/${id}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getByMatricule(matricule: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/${matricule}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(request: AgentRequest): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(this.apiUrl, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(matricule: string, request: AgentRequest): Observable<AgentResponse> {
    return this.http.put<AgentResponse>(`${this.apiUrl}/${matricule}`, request, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  changeStatus(matricule: string, enabled: boolean): Observable<AgentResponse> {
    return this.http.patch<AgentResponse>(`${this.apiUrl}/${matricule}/status?enabled=${enabled}`, {}, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }

  delete(matricule: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${matricule}`, this.headers).pipe(
      catchError(error => this.handleError(error))
    );
  }
}