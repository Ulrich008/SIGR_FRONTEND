export interface MinistereRequest {
  code: string;
  nom: string;
  sigle?: string;
  description?: string;
}

export interface MinistereResponse {
  id: string;
  code: string;
  nom: string;
  sigle?: string;
  description?: string;
  creePar?: string;
}
