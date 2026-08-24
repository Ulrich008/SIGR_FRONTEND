import { StatutSuiviRecommandation } from './suivi-recommandation.model';

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

// Circuit de validation : Formalisation (Correspondant) -> Manager Risque
// -> CCI -> Responsable (visa) -> CCI -> CMMR -> Validée/Rejetée. Manager
// Risque et CCI ne font que relayer (action "Transmettre") ; seuls
// Responsable et CMMR rendent un avis (Valider/Différer/Rejeter). Un
// différé revient toujours à Manager Risque, qui relaie ensuite au
// Correspondant pour correction.
export enum EtapeValidation {
  FORMALISATION = 'FORMALISATION',
  MANAGER_RISQUE = 'MANAGER_RISQUE',
  CCI_VERS_RESPONSABLE = 'CCI_VERS_RESPONSABLE',
  RESPONSABLE = 'RESPONSABLE',
  CCI_VERS_CMMR = 'CCI_VERS_CMMR',
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
  /** Finalité du processus (parmi Processus.finalites) menacée par ce risque. */
  finalite: string;
  causeProbable?: string[];
  consequenceProbable?: string[];
  bonnesPratiques?: string[];
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
  finalite?: string;
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
  emetteurAvisMatricule?: string;
  emetteurAvisNomComplet?: string;
  emetteurAvisCodeProfil?: string;
  emetteurAvisLibelleProfil?: string;
  /** Vrai si le risque a au moins une évaluation liée (condition pour être transmis). */
  evalue: boolean;
  statutSuivi?: StatutSuiviRecommandation;
  decisionSuivi?: string;
  dateDecisionSuivi?: string;
}

/**
 * Une entrée de l'historique des avis de validation d'un risque (Transmis,
 * Validé, Différé, Rejeté), reconstituée côté backend depuis les révisions
 * Envers — avis/motif ne gardent normalement que la dernière décision sur
 * RisqueResponse, ceci couvre tous les allers-retours passés dans le circuit.
 */
export interface AvisHistoriqueResponse {
  date: string; // ISO date-time string
  avis?: AvisRisque;
  motif?: string;
  etapeValidation?: EtapeValidation;
  matriculeAuteur?: string;
  nomAuteur?: string;
}