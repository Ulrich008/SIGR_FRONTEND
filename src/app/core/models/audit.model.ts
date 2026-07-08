export enum AuditPropose {
  OPERATIONNEL_PERFORMANCE = 'OPERATIONNEL_PERFORMANCE',
  CONFORMITE_REGULARITE = 'CONFORMITE_REGULARITE',
  EVALUATION_FRAUDES_ERREURS = 'EVALUATION_FRAUDES_ERREURS',
  CONTROLE_INTERNE = 'CONTROLE_INTERNE',
  VALIDATION_FIABILITE_INTEGRITE = 'VALIDATION_FIABILITE_INTEGRITE',
  AUDIT_SUIVI = 'AUDIT_SUIVI'
}

export enum TypeRevue {
  ASSURANCE_CARTOGRAPHIE_RISQUES = 'ASSURANCE_CARTOGRAPHIE_RISQUES',
  ASSURANCE_CONTROLE_INTERNE = 'ASSURANCE_CONTROLE_INTERNE',
  REVUE_ASSURANCE_QUALITE = 'REVUE_ASSURANCE_QUALITE',
  REVUE_SUIVI_RECOMMANDATIONS = 'REVUE_SUIVI_RECOMMANDATIONS'
}

export interface PlanAuditRequest {
  libelle: string;
  dateCreation: string; // ISO date string
  codeUniteAdministrative: string;
  codeProcessus: string;
  codeRisque?: string;
  auditPropose: AuditPropose;
  typeRevue: TypeRevue;
  objectifAudit?: string;
  effetAuditIndicatif?: string;
}

export interface PlanAuditResponse {
  id: string;
  code: string;
  libelle: string;
  dateCreation: string;
  codeUniteAdministrative: string;
  nomUniteAdministrative: string;
  codeProcessus: string;
  nomProcessus: string;
  codeRisque?: string;
  libelleRisque?: string;
  auditPropose: AuditPropose;
  typeRevue: TypeRevue;
  objectifAudit?: string;
  effetAuditIndicatif?: string;
}
