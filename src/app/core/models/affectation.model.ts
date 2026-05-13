export interface Affectation {
  id: number;
  agentId: number;
  uniteAdministrativeId: number;
  role: string;
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
}
