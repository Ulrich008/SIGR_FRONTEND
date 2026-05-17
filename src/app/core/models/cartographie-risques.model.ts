export enum StatutCartographie {
  BROUILLON = 'BROUILLON',
  EN_COURS = 'EN_COURS',
  VALIDEE = 'VALIDEE',
  ARCHIVEE = 'ARCHIVEE'
}

export interface CartographieRisquesRequest {
  code?: string;
  titre: string;
  periode: string; // ISO date string
  seuilFaible: number;
  seuilMoyen: number;
  seuilEleve: number;
  statut: StatutCartographie;
}

export interface CartographieRisquesResponse {
  id: string;
  code: string;
  titre: string;
  periode: string; // ISO date string
  seuilFaible: number;
  seuilMoyen: number;
  seuilEleve: number;
  statut: StatutCartographie;
  nombreRisques: number;
}
