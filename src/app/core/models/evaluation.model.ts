export interface EvaluationRequest {
  code?: string;
  impact: number;
  probabilite: number;
  dateEvaluation: string; // ISO date string
  bonnesPratiques?: string;
  niveauControle: number;
  codeRisque: string;
  matriculeAgent?: string;
}

export interface EvaluationResponse {
  id: string;
  code: string;
  impact: number;
  probabilite: number;
  dateEvaluation: string; // ISO date string
  bonnesPratiques?: string;
  niveauControle: number;
  scoreInitial: number;
  idRisque: string;
  libelleRisque: string;
  idAgent: string;
  nomAgent: string;
}
