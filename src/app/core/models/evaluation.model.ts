import { EtapeValidation } from './risque.model';

export interface EvaluationRequest {
  impactInherent: number;
  probabiliteInherente: number;
  protection: number;
  prevention: number;

  controleExistants?: string;
  controleInexistants?: string;
  dejaSurvenu?: boolean;

  dateDebut?: string;
  dateFin?: string;

  recommandation?: string;

  codeRisque: string;
  matriculeAgent?: string;
}

export interface EvaluationResponse {
  id: string;
  code: string;

  impactInherent: number;
  probabiliteInherente: number;
  scoreInherent: number;

  protection: number;
  prevention: number;

  controleExistants?: string;
  controleInexistants?: string;
  dejaSurvenu?: boolean;

  impactResiduel: number;
  probabiliteResiduelle: number;
  scoreResiduel: number;

  rangPriorite: number;
  libellePriorite?: string;

  strategieRisque?: string;
  strategieRisqueDescription?: string;

  dateDebut?: string;
  dateFin?: string;

  recommandation?: string;

  codeRisque: string;
  libelleRisque: string;
  idRisque: string;

  /** État du risque parent, pour verrouiller l'édition tant qu'il est transmis et hors Formalisation. */
  risqueTransmis?: boolean;
  risqueEtapeValidation?: EtapeValidation;

  matriculeAgent?: string;
  nomAgent?: string;
}
