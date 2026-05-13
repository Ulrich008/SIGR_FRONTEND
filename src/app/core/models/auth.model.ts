export interface LoginRequest {
  matricule: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  matricule: string;
  nom: string;
  prenoms: string;
  role: string;
}