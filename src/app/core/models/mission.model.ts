export interface MissionRequest {
  code?: string;
  libelle: string;
  description?: string;
  codeProcessus: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  codeResponsable?: string;
}

export interface MissionResponse {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  codeProcessus: string;
  nomProcessus: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  codeResponsable?: string;
  nomResponsable?: string;
}
