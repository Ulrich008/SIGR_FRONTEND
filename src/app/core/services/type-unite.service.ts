import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeUniteRequest, TypeUniteResponse } from '../models/type-unite.model';

@Injectable({
  providedIn: 'root'
})
export class TypeUniteService {
  private readonly apiUrl = `${environment.apiUrl}/api/typeunite`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TypeUniteResponse[]> {
    return this.http.get<TypeUniteResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<TypeUniteResponse> {
    return this.http.get<TypeUniteResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: TypeUniteRequest): Observable<TypeUniteResponse> {
    return this.http.post<TypeUniteResponse>(this.apiUrl, request);
  }

  update(code: string, request: TypeUniteRequest): Observable<TypeUniteResponse> {
    return this.http.put<TypeUniteResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
