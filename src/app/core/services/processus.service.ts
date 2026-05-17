import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessusRequest, ProcessusResponse } from '../models/processus.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessusService {
  private readonly apiUrl = `${environment.apiUrl}/api/processus`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProcessusResponse[]> {
    return this.http.get<ProcessusResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<ProcessusResponse> {
    return this.http.get<ProcessusResponse>(`${this.apiUrl}/${code}`);
  }

  create(request: ProcessusRequest): Observable<ProcessusResponse> {
    return this.http.post<ProcessusResponse>(this.apiUrl, request);
  }

  update(code: string, request: ProcessusRequest): Observable<ProcessusResponse> {
    return this.http.put<ProcessusResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
