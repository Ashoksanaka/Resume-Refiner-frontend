// ==================================================
// Resume AI Platform - TypeScript Type Definitions
// Source of truth: API_AND_DATA_CONTRACTS.md
// ==================================================

// -------------------------------------------------
// Auth Types
// -------------------------------------------------

export interface User {
  readonly id: string;
  email: string;
  readonly is_verified: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface VerifyRequest {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// -------------------------------------------------
// Profile Types (matches /backend/schemas/profile.json)
// -------------------------------------------------

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone_number?: string;
  location?: string;
  portfolio_url?: string;
}

export interface Experience {
  company: string;
  title: string;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null; // "YYYY-MM-DD"
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null; // "YYYY-MM-DD"
  description?: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date?: string; // "YYYY-MM-DD"
}

export interface Project {
  id: string;
  title: string;
  role: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  ongoing: boolean;
  technologies?: string[];
  link?: string | null;
  achievements?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  issuer?: string;
  date?: string | null;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue?: string;
  date?: string | null;
  url?: string | null;
  abstract?: string;
}

export interface Patent {
  id: string;
  title: string;
  patent_number: string;
  status: 'filed' | 'granted' | 'pending';
  filing_date?: string | null;
  grant_date?: string | null;
  url?: string | null;
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
}

export interface License {
  id: string;
  name: string;
  issuer: string;
  license_number?: string;
  date?: string | null;
  url?: string | null;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  date?: string | null;
  certificate_url?: string | null;
  description?: string;
}

export interface TestScore {
  id: string;
  test_name: string;
  score: number | string;
  max_score?: number | null;
  percentile?: number | null;
  date?: string | null;
}

export interface Language {
  language: string;
  proficiency: 'native' | 'full_professional' | 'limited_professional' | 'conversational' | 'basic';
  certification?: string;
}

export interface Organization {
  id: string;
  name: string;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
}

export interface Position {
  id: string;
  title: string;
  organization: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
}

export interface CareerBreak {
  id: string;
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
}

export interface Profile {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications?: Certification[];
  projects?: Project[];
  achievements?: Achievement[];
  publications?: Publication[];
  patents?: Patent[];
  volunteering?: Volunteering[];
  licenses?: License[];
  trainings?: Training[];
  test_scores?: TestScore[];
  languages?: Language[];
  organizations?: Organization[];
  positions?: Position[];
  career_breaks?: CareerBreak[];
  areas_of_interest?: string[];
  hobbies?: string[];
}

// -------------------------------------------------
// Job Description Types
// -------------------------------------------------

export interface JobDescriptionRequest {
  text: string;
}

export interface JobDescription {
  readonly id: string;
  text: string;
  readonly created_at: string; // ISO 8601
  readonly expires_at: string; // ISO 8601
}

// -------------------------------------------------
// Resume Generation Types
// -------------------------------------------------

export type GenerationStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface ResumeGenerationRequest {
  readonly id: string;
  readonly status: GenerationStatus;
  readonly failure_reason: string | null;
  readonly created_at: string; // ISO 8601
  readonly expires_at: string; // ISO 8601
}

export interface TriggerGenerationRequest {
  job_description_id: string;
  template_id?: string; // Optional, defaults to 'tccv' on backend
}

export interface ResumeSource {
  latex_source: string;
  modifications: string[];
}

// -------------------------------------------------
// Error Types
// -------------------------------------------------

export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_PAYLOAD'
  | 'TTL_EXPIRED'
  | 'MODEL_OUTPUT_INVALID'
  | 'LATEX_COMPILE_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'AI_SERVICE_QUOTA_EXCEEDED'
  | 'LATEX_SERVICE_ERROR'
  | 'GENERATION_TIMEOUT'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN';

export interface ApiError {
  error_code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

// New auth error format (with code and errors array)
export interface AuthError {
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    code: string;
  }>;
}

// Legacy error format (with error_code and details)
export interface LegacyApiError {
  error_code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

// -------------------------------------------------
// API Response Helpers
// -------------------------------------------------

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// -------------------------------------------------
// Utility Types
// -------------------------------------------------

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error_code' in error &&
    'message' in error
  );
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
