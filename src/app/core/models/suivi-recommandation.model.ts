export enum StatutSuiviRecommandation {
  NON_ENTAME = 'NON_ENTAME',
  EN_COURS = 'EN_COURS',
  REALISEE = 'REALISEE',
  NON_REALISEE = 'NON_REALISEE'
}

export interface SuiviRecommandationRequest {
  statutSuivi: StatutSuiviRecommandation;
  decision?: string;
}

// Suivi des recommandations CI : statut (Contrôleur Interne) et décision
// (CCI) sont deux actions distinctes, chacune réservée à son rôle.
export interface StatutSuiviRequest {
  statutSuivi: StatutSuiviRecommandation;
}

export interface DecisionSuiviRequest {
  decision?: string;
}
