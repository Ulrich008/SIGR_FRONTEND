export type TypeNotification =
  | 'RISQUE_SANS_MITIGATION'
  | 'RISQUE_SANS_ACTIONS_EN_COURS'
  | 'INDICATEUR_SEUIL_DEPASSE'
  | 'INDICATEUR_ECHEANCE_PROCHE'
  | 'RISQUE_EN_ATTENTE_VALIDATION';

export type SeveriteAlerte = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'FAIBLE';

export interface NotificationResponse {
  id: string;
  type: TypeNotification;
  titre: string;
  description: string;
  codeElement: string;
  libelleElement: string;
  codeProcessus?: string;
  libelleProcessus?: string;
  severite: SeveriteAlerte;
  dateAlerte: string;
  lu: boolean;
  dateLecture?: string;
}
