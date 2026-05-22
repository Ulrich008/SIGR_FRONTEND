export interface ProfilRequest {
  code: string;
  libelle: string;
  description?: string;
}

export interface ProfilResponse {
  id: string;
  code: string;
  libelle: string;
  description?: string;
}