export interface RisqueResiduelRequest {
  code?: string;
  impactResiduel: number;
  probabiliteResiduelle: number;
  codeEvaluation: string;
  codeRisque: string;
}

export interface RisqueResiduelResponse {
  id: string;
  code: string;
  impactResiduel: number;
  probabiliteResiduelle: number;
  scoreResiduel: number;
  niveauRisque: string;
  codeEvaluation: string;
  codeRisque: string;
  libelleRisque: string;
}
