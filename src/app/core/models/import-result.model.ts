export interface ImportLigneErreur {
  ligne: number;
  message: string;
}

export interface ImportResult {
  totalLignes: number;
  succes: number;
  echecs: ImportLigneErreur[];
}
