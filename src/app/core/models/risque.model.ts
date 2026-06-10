export enum TypeRisque {
  STRATEGIQUE_PILOTAGE = 'STRATEGIQUE_PILOTAGE',
  OPERATIONNEL = 'OPERATIONNEL',
  FINANCIER = 'FINANCIER',
  RESSOURCES_HUMAINES = 'RESSOURCES_HUMAINES',
  ETHIQUE_DEONTOLOGIE_FRAUDE = 'ETHIQUE_DEONTOLOGIE_FRAUDE',
  JURIDIQUE = 'JURIDIQUE',
  INFORMATIQUE = 'INFORMATIQUE',
  IMAGE_REPUTATION = 'IMAGE_REPUTATION',
  GESTION_CONNAISSANCE = 'GESTION_CONNAISSANCE',
  EXTERNE = 'EXTERNE'
}

export enum StatutRisque {
  ACTIF = 'ACTIF',
  EN_COURS = 'EN_COURS',
  MAITRISE = 'MAITRISE',
  CLOTURE = 'CLOTURE',
  SUPPRIME = 'SUPPRIME'
}

export enum StrategieRisque {
  TRAITER = 'TRAITER',
  TRANSFERER = 'TRANSFERER',
  TOLERER = 'TOLERER',
  TERMINER = 'TERMINER'
}

export interface RisqueRequest {
  code?: string;
  libelle: string;
  causeProbable?: string[];
  consequenceProbable?: string[];
  bonnesPratiques?: string[];
  statut: StatutRisque;
  strategieRisque?: StrategieRisque;
  dateIdentification: string; // ISO date string
  codeProcessus: string;
  codeCartographie?: string;
  typeRisque: TypeRisque;
}

export interface RisqueResponse {
  id: string;
  code: string;
  libelle: string;
  causeProbable?: string[];
  consequenceProbable?: string[];
  bonnesPratiques?: string[];
  statut: StatutRisque;
  strategieRisque?: StrategieRisque;
  dateIdentification: string; // ISO date string
  codeProcessus: string;
  nomProcessus: string;
  idCartographie: string;
  typeRisque: TypeRisque;
  risquesResiduelsIds: string[];
}