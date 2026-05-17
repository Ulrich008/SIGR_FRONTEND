export type Sexe = 'MASCULIN' | 'FEMININ';
export type Role = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface AgentRequest {
  matricule: string;
  password: string;
  npi?: string;
  nom: string;
  prenoms: string;
  sexe: Sexe;
  role: Role;
  dateNaissance: string;
  datePriseService: string;
  codeUnite: string;
}

export interface AgentResponse {
  id: string;
  matricule: string;
  npi?: string;
  nom: string;
  prenoms: string;
  sexe: Sexe;
  role: Role;
  enabled: boolean;
  dateNaissance: string;
  datePriseService: string;
  codeUnite: string;
  libelleUnite?: string;
}
