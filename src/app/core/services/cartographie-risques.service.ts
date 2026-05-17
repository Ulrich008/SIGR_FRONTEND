import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartographieRisquesRequest, CartographieRisquesResponse } from '../models/cartographie-risques.model';

@Injectable({
  providedIn: 'root'
})
export class CartographieRisquesService {
  private readonly apiUrl = `${environment.apiUrl}/api/cartographies`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CartographieRisquesResponse[]> {
    return this.http.get<CartographieRisquesResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<CartographieRisquesResponse> {
    return this.http.get<CartographieRisquesResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: CartographieRisquesRequest): Observable<CartographieRisquesResponse> {
    return this.http.post<CartographieRisquesResponse>(this.apiUrl, request);
  }

  update(code: string, request: CartographieRisquesRequest): Observable<CartographieRisquesResponse> {
    return this.http.put<CartographieRisquesResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
