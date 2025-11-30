




export enum UserRole {
  ADMIN = 'admin',
  BANK = 'bank',
}

export enum ReportCategory {
  CORRECTIVE = 'الديكورات التصحيحية',
  MODERN = 'الديكورات الحديثة',
}

export interface User {
  id: string;
  username: string;
  // FIX: Added optional password property.
  password?: string;
  role: UserRole;
  name: string;
}

export interface Report {
  id:string;
  atm_name: string;
  atm_number: string;
  serial_number: string;
  governorate: string;
  address: string;
  maintenance_date: string; // ISO string format
  technical_report: string;
  notes: string;
  before_photos: string[]; // URLs or data URLs
  after_photos: string[]; // URLs or data URLs
  category: ReportCategory[];
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
