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

export enum AvisRisque {
  VALIDE = 'VALIDE',
  DIFFERE = 'DIFFERE',
  REJETE = 'REJETE',
  EN_ATTENTE = 'EN_ATTENTE'
}

// Circuit de validation : Formalisation -> Pilote -> CCI -> CMMR -> Validée/Rejetée
export enum EtapeValidation {
  FORMALISATION = 'FORMALISATION',
  PILOTE = 'PILOTE',
  CCI = 'CCI',
  CMMR = 'CMMR',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE'
}

export interface AvisRisqueRequest {
  avis: AvisRisque;
  motif?: string;
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
  avis?: AvisRisque;
  motif?: string;
  transmis?: boolean;
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
  avis?: AvisRisque;
  motif?: string;
  transmis?: boolean;
  etapeValidation?: EtapeValidation;
}