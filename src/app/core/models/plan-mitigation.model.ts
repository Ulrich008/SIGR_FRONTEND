export enum StatutPlanMitigation {
  EN_COURS = 'EN_COURS',
  PLANIFIE = 'PLANIFIE',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

export interface PlanMitigationRequest {
  description?: string;
  dateCreation: string;
  statut: StatutPlanMitigation;
  codeRisque: string;
}

export interface PlanMitigationResponse {
  id: string;
  code: string;
  description?: string;
  dateCreation: string;
  statut: StatutPlanMitigation;
  codeRisque: string;
  libelleRisque: string;
}
