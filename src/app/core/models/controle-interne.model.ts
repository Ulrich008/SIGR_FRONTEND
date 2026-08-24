import { StatutSuiviRecommandation } from './suivi-recommandation.model';

export enum StatutRapportCI {
  EN_ATTENTE_DE_VALIDATION = 'EN_ATTENTE_DE_VALIDATION',
  TRANSMIS = 'TRANSMIS',
  VALIDE = 'VALIDE',
  DIFFERE = 'DIFFERE',
  REJETE = 'REJETE'
}

// ================= CONTRÔLE DE SECOND NIVEAU =================

export interface ControleSecondNiveauRequest {
  codeUniteAdministrative: string;
  codeProcessus: string;
  dateControle: string;

  testsLibelle?: string;
  testsConstats?: string;
  testsAnalyse?: string;
  testsRecommandation?: string;

  revuesLibelle?: string;
  revuesConstats?: string;
  revuesAnalyse?: string;
  revuesRecommandation?: string;

  verificationLibelleDesPieces?: string;
  verificationConstats?: string;
  verificationAnalyse?: string;
  verificationRecommandation?: string;

  evolutionIntituleOperation?: string;
  evolutionProceduresInternesRenforcements?: string;
  evolutionResultatsConformite?: string;
  evolutionAnalyse?: string;
  evolutionRecommandation?: string;

  anomalieConstat?: string;
  anomalieAnalyse?: string;
  anomalieRecommandation?: string;

  faiblesseConstat?: string;
  faiblesseAnalyse?: string;
  faiblesseRecommandation?: string;
}

export interface ControleSecondNiveauResponse {
  id: string;
  code: string;

  codeUniteAdministrative: string;
  libelleUniteAdministrative: string;
  codeProcessus: string;
  libelleProcessus: string;

  dateControle: string;

  testsLibelle?: string;
  testsConstats?: string;
  testsAnalyse?: string;
  testsRecommandation?: string;

  revuesLibelle?: string;
  revuesConstats?: string;
  revuesAnalyse?: string;
  revuesRecommandation?: string;

  verificationLibelleDesPieces?: string;
  verificationConstats?: string;
  verificationAnalyse?: string;
  verificationRecommandation?: string;

  evolutionIntituleOperation?: string;
  evolutionProceduresInternesRenforcements?: string;
  evolutionResultatsConformite?: string;
  evolutionAnalyse?: string;
  evolutionRecommandation?: string;

  anomalieConstat?: string;
  anomalieAnalyse?: string;
  anomalieRecommandation?: string;

  faiblesseConstat?: string;
  faiblesseAnalyse?: string;
  faiblesseRecommandation?: string;

  creePar?: string;
}

export interface ConstatsRecommandationsResponse {
  constats: string[];
  recommandations: string[];
}

/**
 * Une "ligne" d'un Contrôle de second niveau (Tests, Revues, Vérification,
 * Évolution de conformité, Anomalie ou Faiblesse) : constat, analyse et
 * recommandation restent groupés et rattachés à leur contrôle d'origine
 * (codeControle/dateControle/categorie), pour un affichage clairement relié
 * plutôt que des listes plates mélangées — alimente les étapes Préambule et
 * Analyses/Recommandations du formulaire Rapport, ainsi que son aperçu.
 */
export interface LigneControleResponse {
  codeControle: string;
  dateControle: string;
  categorie: 'Tests' | 'Revues' | 'Vérification' | 'Évolution de conformité' | 'Anomalie' | 'Faiblesse';
  libelle?: string;
  constat?: string;
  analyse?: string;
  recommandation?: string;
}

export interface ActionCorrective {
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

// ================= RAPPORT DE CONTRÔLE INTERNE =================

export interface RapportControleInterneRequest {
  codeUniteAdministrative: string;
  codeProcessus: string;
  dateEmission: string;
  preambule?: string;
  actionsCorrectives?: ActionCorrective[];
  conclusion?: string;
}

export interface RapportControleInterneResponse {
  id: string;
  code: string;

  codeUniteAdministrative: string;
  libelleUniteAdministrative: string;
  codeProcessus: string;
  libelleProcessus: string;

  dateEmission: string;

  preambule?: string;
  actionsCorrectives?: ActionCorrective[];
  conclusion?: string;

  statut?: StatutRapportCI;
  motif?: string;

  pdfDisponible: boolean;
  pdfGenereLe?: string;

  creePar?: string;

  statutSuivi?: StatutSuiviRecommandation;
  decisionSuivi?: string;
  dateDecisionSuivi?: string;
}

export interface AvisRapportCIRequest {
  avis: StatutRapportCI.VALIDE | StatutRapportCI.DIFFERE | StatutRapportCI.REJETE;
  motif?: string;
}

export interface AvisHistoriqueRapportCIResponse {
  date: string; // ISO date-time string
  statut?: StatutRapportCI;
  motif?: string;
  matriculeAuteur?: string;
  nomAuteur?: string;
}
