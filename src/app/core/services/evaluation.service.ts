import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvaluationRequest, EvaluationResponse } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private readonly apiUrl = `${environment.apiUrl}/api/evaluations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.apiUrl, request);
  }

  update(code: string, request: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.put<EvaluationResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
