export enum StatutPlanMitigation {
  EN_COURS = 'EN_COURS',
  PLANIFIE = 'PLANIFIE',
  TERMINE = 'TERMINE',
  CLOTURE = 'CLOTURE'
}

export interface PlanMitigationRequest {
  description?: string;
  libelle?: string;
  dateCreation: string;
  codesRisques: string[];
}

export interface PlanMitigationResponse {
  id: string;
  code: string;
  description?: string;
  libelle?: string;
  dateCreation: string;
  statut: StatutPlanMitigation;
  codesRisques: string[];
  libellesRisques: string[];
}
