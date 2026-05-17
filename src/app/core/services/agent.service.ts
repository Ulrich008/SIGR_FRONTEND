import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRequest, AgentResponse } from '../models/agent.model';
import { AuthService } from './auth.service'; // ← ajout

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly apiUrl = `${environment.apiUrl}/api/agents`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // ← ajout
  ) {}

  private get headers() {
    return { headers: this.authService.getAuthHeaders() }; // ← ajout
  }

  getAll(): Observable<AgentResponse[]> {
    return this.http.get<AgentResponse[]>(this.apiUrl, this.headers);
  }

  getById(id: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/id/${id}`, this.headers);
  }

  getByMatricule(matricule: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiUrl}/${matricule}`, this.headers);
  }

  create(request: AgentRequest): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(this.apiUrl, request, this.headers);
  }

  update(matricule: string, request: AgentRequest): Observable<AgentResponse> {
    return this.http.put<AgentResponse>(`${this.apiUrl}/${matricule}`, request, this.headers);
  }

  changeStatus(matricule: string, enabled: boolean): Observable<AgentResponse> {
    return this.http.patch<AgentResponse>(`${this.apiUrl}/${matricule}/status?enabled=${enabled}`, {}, this.headers);
  }

  delete(matricule: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${matricule}`, this.headers);
  }
}