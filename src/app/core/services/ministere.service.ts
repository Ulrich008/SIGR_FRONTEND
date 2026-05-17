import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MinistereRequest, MinistereResponse } from '../models/ministere.model';
import { AuthService } from './auth.service'; // ← ajout

@Injectable({
  providedIn: 'root'
})
export class MinistereService {
  private readonly apiUrl = `${environment.apiUrl}/api/ministeres`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // ← ajout
  ) {}

  private get headers() {
    return { headers: this.authService.getAuthHeaders() }; // ← ajout
  }

  getAll(): Observable<MinistereResponse[]> {
    return this.http.get<MinistereResponse[]>(this.apiUrl, this.headers);
  }

  getById(id: string): Observable<MinistereResponse> {
    return this.http.get<MinistereResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  create(request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.post<MinistereResponse>(this.apiUrl, request, this.headers);
  }

  update(id: string, request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.put<MinistereResponse>(`${this.apiUrl}/${id}`, request, this.headers);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.headers);
  }
}