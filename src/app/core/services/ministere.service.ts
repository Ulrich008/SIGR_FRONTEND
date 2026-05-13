import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MinistereRequest, MinistereResponse } from '../models/ministere.model';

@Injectable({
  providedIn: 'root'
})
export class MinistereService {
  private readonly apiUrl = `${environment.apiUrl}/api/ministeres`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MinistereResponse[]> {
    return this.http.get<MinistereResponse[]>(this.apiUrl);
  }

  getById(id: string): Observable<MinistereResponse> {
    return this.http.get<MinistereResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.post<MinistereResponse>(this.apiUrl, request);
  }

  update(id: string, request: MinistereRequest): Observable<MinistereResponse> {
    return this.http.put<MinistereResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
