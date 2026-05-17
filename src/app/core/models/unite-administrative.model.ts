export interface UniteAdministrativeRequest {
  code: string;
  libelle: string;
  idTypeUnite: string;
  codeMinistere: string;
  idUniteParent?: string;
  niveauHierarchique: number;
}

export interface UniteAdministrativeResponse {
  id: string;
  code: string;
  libelle: string;
  typeUniteId: string;
  typeUniteLibelle: string;
  codeMinistere: string;
  nomMinistere: string;
  idUniteParent?: string;
  niveauHierarchique: number;
}
