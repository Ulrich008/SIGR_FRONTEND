export enum TypeUnite {
  NUMERIQUE = 'NUMERIQUE',
  DATE = 'DATE'
}

export interface UniteMesureRequest {
  code?: string;
  libelle?: string;
  symbole?: string;
  description?: string;
  typeUnite?: TypeUnite;
}

export interface UniteMesureResponse {
  id: string;
  code: string;
  libelle: string;
  symbole?: string;
  description?: string;
  typeUnite?: string;
}
