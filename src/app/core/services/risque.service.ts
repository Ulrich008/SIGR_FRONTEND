import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RisqueRequest, RisqueResponse } from '../models/risque.model';

@Injectable({
  providedIn: 'root'
})
export class RisqueService {
  private readonly apiUrl = `${environment.apiUrl}/api/risques`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RisqueResponse[]> {
    return this.http.get<RisqueResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<RisqueResponse> {
    return this.http.get<RisqueResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: RisqueRequest): Observable<RisqueResponse> {
    return this.http.post<RisqueResponse>(this.apiUrl, request);
  }

  updateByCode(code: string, request: RisqueRequest): Observable<RisqueResponse> {
    return this.http.put<RisqueResponse>(`${this.apiUrl}/${code}`, request);
  }

  deleteByCode(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
