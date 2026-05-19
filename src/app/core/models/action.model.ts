export enum StatutAction {
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  EN_RETARD = 'EN_RETARD',
  ANNULEE = 'ANNULEE'
}

export interface ActionRequest {
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAction;
  codePlan: string;
  matriculeResponsable: string;
}

export interface ActionResponse {
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAction;
  codePlan: string;
  matriculeResponsable: string;
  nomResponsable: string;
}
