export interface AlerteResponse {
  id: string;
  type: string; // RISQUE_NON_GERE, INDICATEUR_PROCHE_SEUIL
  titre: string;
  description: string;
  codeElement: string; // code du risque ou de l'indicateur
  libelleElement: string;
  dateAlerte: string;
  severite: string; // CRITIQUE, HAUTE, MOYENNE, FAIBLE
  codeProcessus: string;
  libelleProcessus: string;
}
