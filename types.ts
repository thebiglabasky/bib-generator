export interface RaceConfig {
  id: string;
  label: string;
  yearMatch: string; // e.g., "2020", "2019", "2020 ; 2019", "2016 et avant"
  color: string;
  isParent?: boolean;
}

export interface ColumnMapping {
  orderRef?: number;
  familyName?: number;
  adultFirstName?: number;
  childFirstName?: number;
  birthYear?: number;
  relay?: number;
  adult2FirstName?: number;
}

export interface BibData {
  bibNumber: number;
  firstName: string;
  lastName: string;
  raceConfig: RaceConfig;
}

export interface ParsedRow {
  [key: string]: string;
}


