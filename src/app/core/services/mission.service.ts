import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MissionRequest, MissionResponse } from '../models/mission.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private apiUrl = `${environment.apiUrl}/api/missions`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<MissionResponse[]> {
    return this.http.get<MissionResponse[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<MissionResponse> {
    return this.http.get<MissionResponse>(`${this.apiUrl}/${code}`);
  }

  getByProcessusId(processusId: string): Observable<MissionResponse[]> {
    return this.http.get<MissionResponse[]>(`${this.apiUrl}/processus/${processusId}`);
  }

  create(request: MissionRequest): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(this.apiUrl, request);
  }

  update(code: string, request: MissionRequest): Observable<MissionResponse> {
    return this.http.put<MissionResponse>(`${this.apiUrl}/${code}`, request);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}
