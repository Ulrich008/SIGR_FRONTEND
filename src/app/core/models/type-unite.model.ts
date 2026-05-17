export interface TypeUniteRequest {
  code: string;
  libelle: string;
  description?: string;
}

export interface TypeUniteResponse {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  creePar: string;
}
