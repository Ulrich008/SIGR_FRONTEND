import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AffectationRequest, AffectationResponse } from '../models/affectation.model';

@Injectable({
  providedIn: 'root'
})
export class AffectationService {
  private readonly apiUrl = `${environment.apiUrl}/api/affectations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AffectationResponse[]> {
    return this.http.get<AffectationResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<AffectationResponse> {
    return this.http.get<AffectationResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: AffectationRequest): Observable<AffectationResponse> {
    return this.http.post<AffectationResponse>(this.apiUrl, request);
  }

  update(code: string, request: AffectationRequest): Observable<AffectationResponse> {
    return this.http.put<AffectationResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
