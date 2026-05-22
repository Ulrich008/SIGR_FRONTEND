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
  codeProfil: string;        // ← nouveau champ obligatoire
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
  codeProfil?: string;       // ← retourné par le backend
  libelleProfil?: string;    // ← libellé du profil pour affichage
  enabled: boolean;
  dateNaissance: string;
  datePriseService: string;
  codeUnite: string;
  libelleUnite?: string;
}