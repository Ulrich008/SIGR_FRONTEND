export enum Frequence {
  JOURNALIERE = 'JOURNALIERE',
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  ANNUELLE = 'ANNUELLE'
}

export interface IndicateurPerformanceRequest {
  code?: string;
  libelle: string;
  frequence: Frequence;
  valeurCible?: number;
  valeurObtenue?: number;
  seuilAlerte?: number;
  dateMesure: string;
  codeProcessus: string;
}

export interface IndicateurPerformanceResponse {
  id: string;
  code: string;
  libelle: string;
  uniteMesure: string;
  frequence: Frequence;
  valeurCible?: number;
  valeurObtenue?: number;
  seuilAlerte?: number;
  dateMesure: string;
  codeProcessus: string;
  nomProcessus: string;
  ecartCible?: number;
  statut: string;
}
