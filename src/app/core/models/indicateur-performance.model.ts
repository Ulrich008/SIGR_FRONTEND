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
  valeurCible?: string; // Peut être un nombre ou une date (string)
  valeurObtenue?: string; // Peut être un nombre ou une date (string)
  seuilAlerte?: string; // Date au format string
  codeUniteMesure?: string;
  dateDebut?: string;
  dateFin?: string;
  codeProcessus: string;
  codeRisque?: string;
  codePlanMitigation?: string;
  codeAction?: string;
}

export interface IndicateurPerformanceResponse {
  id: string;
  code: string;
  libelle: string;
  codeUniteMesure?: string;
  libelleUniteMesure?: string;
  typeUniteMesure?: string; // NUMERIQUE ou DATE
  frequence: Frequence;
  valeurCible?: string; // Peut être un nombre ou une date (string)
  valeurObtenue?: string; // Peut être un nombre ou une date (string)
  seuilAlerte?: string; // Date au format string
  dateDebut?: string;
  dateFin?: string;
  codeProcessus: string;
  nomProcessus: string;
  codeRisque?: string;
  libelleRisque?: string;
  codePlanMitigation?: string;
  libellePlanMitigation?: string;
  codeAction?: string;
  libelleAction?: string;
  ecartCible?: number;
  statut: string;
}
