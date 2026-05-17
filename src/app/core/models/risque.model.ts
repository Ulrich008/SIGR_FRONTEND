export enum TypeRisque {
  FINANCIER = 'FINANCIER',
  OPERATIONNEL = 'OPERATIONNEL',
  JURIDIQUE = 'JURIDIQUE',
  STRATEGIQUE = 'STRATEGIQUE',
  TECHNIQUE = 'TECHNIQUE'
}

export enum StatutRisque {
  ACTIF = 'ACTIF',
  EN_COURS = 'EN_COURS',
  MAITRISE = 'MAITRISE',
  CLOTURE = 'CLOTURE',
  SUPPRIME = 'SUPPRIME'
}

export interface RisqueRequest {
  code?: string;
  libelle: string;
  causeProbable?: string;
  consequenceProbable?: string;
  statut: StatutRisque;
  dateIdentification: string; // ISO date string
  codeProcessus: string;
  codeCartographie?: string;
  typeRisque: TypeRisque;
}

export interface RisqueResponse {
  id: string;
  code: string;
  libelle: string;
  causeProbable?: string;
  consequenceProbable?: string;
  statut: StatutRisque;
  dateIdentification: string; // ISO date string
  codeProcessus: string;
  nomProcessus: string;
  idCartographie: string;
  typeRisque: TypeRisque;
  risquesResiduelsIds: string[];
}
