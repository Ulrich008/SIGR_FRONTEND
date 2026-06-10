export enum StatutAction {
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  EN_RETARD = 'EN_RETARD',
  ANNULEE = 'ANNULEE'
}

export interface ActionRequest {
  libelles: string[];
  dateDebut: string;
  dateFin: string;
  statut: StatutAction;
  codePlan: string;
  codeRisque: string;
  bonnePratique: string;
  matriculeResponsable: string;
}

export interface ActionResponse {
  code: string;
  libelles: string[];
  dateDebut: string;
  dateFin: string;
  statut: StatutAction;
  codePlan: string;
  codeRisque: string;
  bonnePratique: string;
  matriculeResponsable: string;
  nomResponsable: string;
}
