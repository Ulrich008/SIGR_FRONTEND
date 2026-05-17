import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UniteAdministrativeRequest, UniteAdministrativeResponse } from '../models/unite-administrative.model';

@Injectable({
  providedIn: 'root'
})
export class UniteAdministrativeService {
  private readonly apiUrl = `${environment.apiUrl}/api/unite-administrative`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UniteAdministrativeResponse[]> {
    return this.http.get<UniteAdministrativeResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<UniteAdministrativeResponse> {
    return this.http.get<UniteAdministrativeResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: UniteAdministrativeRequest): Observable<UniteAdministrativeResponse> {
    return this.http.post<UniteAdministrativeResponse>(this.apiUrl, request);
  }

  update(code: string, request: UniteAdministrativeRequest): Observable<UniteAdministrativeResponse> {
    return this.http.put<UniteAdministrativeResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
