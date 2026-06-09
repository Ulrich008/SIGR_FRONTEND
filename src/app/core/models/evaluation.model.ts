
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

  dateDebut?: string;
  dateFin?: string;

  recommandation?: string;

  codeRisque: string;
  libelleRisque: string;

  matriculeAgent?: string;
  nomAgent?: string;
}
