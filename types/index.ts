/**
 * DentAge 2.0 Global Type Definitions
 */

export type DemirjianStage = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface ToothAnalysis {
  tooth_number: number; // ISO/FDI notation (e.g., 31, 32...)
  stage: DemirjianStage;
  confidence: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Patient {
  id: string;
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  clinical_history?: {
    medical_conditions?: string[];
    chronic_ailments?: string;
    allergies?: string[];
  };
  clinical_notes?: string;
  last_scanned_at?: string;
  created_at: string;
}

export interface OPGAnalysis {
  id: string;
  case_id: string;
  patient_id: string;
  user_id: string;
  clinic_id?: string;
  image_url: string;
  diagnostic_method: 'OPG' | 'Panoramic' | 'Periapical';
  dental_age: number;
  maturity_score: number;
  age_range: string;
  ai_confidence: number;
  tooth_stages: Record<number, string>;
  patients?: {
    name: string;
  };
  morphology_findings?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  license_id: string;
  role: 'enterprise_admin' | 'clinic_admin' | 'practitioner';
  org_id?: string;
  clinic_id?: string;
  clinic_name?: string;
  profile_photo_url?: string;
}
