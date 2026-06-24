import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlerteResponse } from '../models/alerte.model';

@Injectable({
  providedIn: 'root'
})
export class AlerteService {
  private apiUrl = 'http://localhost:8080/api/alertes';

  constructor(private http: HttpClient) {}

  getRisquesNonGeres(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(`${this.apiUrl}/risques-non-geres`);
  }

  getIndicateursProchesSeuil(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(`${this.apiUrl}/indicateurs-proches-seuil`);
  }

  getToutesAlertes(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(`${this.apiUrl}/toutes`);
  }
}
