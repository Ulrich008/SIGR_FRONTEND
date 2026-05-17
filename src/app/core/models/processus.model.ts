export enum TypeProcessus {
  METIER = 'METIER',
  SUPPORT = 'SUPPORT',
  PILOTAGE = 'PILOTAGE'
}

export interface ProcessusRequest {
  code: string;
  libelle: string;
  finalite?: string;
  typeProcessus: TypeProcessus;
  idUnite: string;
  idProprietaire?: string;
}

export interface ProcessusResponse {
  id: string;
  code: string;
  libelle: string;
  finalite?: string;
  typeProcessus: TypeProcessus;
  idUnite: string;
  nomUnite: string;
  idProprietaire?: string;
  nomProprietaire?: string;
}
