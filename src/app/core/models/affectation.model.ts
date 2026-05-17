export interface AffectationRequest {
  code: string;
  matriculeAgent: string;
  codeUnite: string;
  poste: string;
  dateAffectation: string;
  dateFinAffectation?: string;
}

export interface AffectationResponse {
  id: string;
  code: string;
  matriculeAgent: string;
  nomCompletAgent: string;
  codeUnite: string;
  libelleUnite: string;
  poste: string;
  dateAffectation: string;
  dateFinAffectation?: string;
}
