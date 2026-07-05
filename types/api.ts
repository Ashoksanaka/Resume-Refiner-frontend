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
  phone_number: string;
  location: string;
  portfolio_url?: string;
}

export interface Experience {
  company: string;
  title: string;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null; // "YYYY-MM-DD"
  description: string;
}

export interface Education {
  institution: string;
  degree?: string; // Legacy optional field
  degree_level: string;
  degree_level_other?: string;
  course: string;
  course_other?: string;
  specialization: string;
  location: string;
  grade_type: 'percentage' | 'cgpa' | '';
  grade_value?: number;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null; // "YYYY-MM-DD"; null = currently studying
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
  description: string;
  start_date?: string | null;
  end_date?: string | null;
  ongoing: boolean;
  technologies?: string[];
  link?: string | null;
  github_url?: string | null;
  deployment_url?: string | null;
  achievements?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  issuer?: string;
  location?: string;
  is_virtual?: boolean;
  date?: string | null;
}

export interface PublicationAuthor {
  name: string;
  affiliation?: string;
  order?: number;
  is_corresponding?: boolean;
  orcid?: string;
}

export interface Publication {
  id: string;
  title: string;
  subtitle?: string;
  authors: PublicationAuthor[];
  doi?: string;
  pmid?: string;
  pmcid?: string;
  isbn?: string;
  issn?: string;
  arxiv_id?: string;
  editor?: string;
  venue?: string;
  volume?: string;
  issue?: string;
  page_range?: string;
  article_number?: string;
  date?: string | null;
  online_date?: string | null;
  accepted_date?: string | null;
  publication_year?: number;
  publication_month?: number;
  keywords?: string[];
  subject_categories?: string[];
  url?: string | null;
  landing_page_url?: string | null;
  pdf_url?: string | null;
  repository_url?: string | null;
  version_label?: string;
  version_date?: string | null;
  funding_sources?: string[];
  grant_numbers?: string[];
  trial_registry?: string;
  ethics_approvals?: string;
  copyright_holder?: string;
  license?: string;
  reuse_permissions?: string;
  citation_count?: number;
  altmetric_score?: number;
  language?: string;
  publication_type?: string;
  document_type?: string;
  abstract?: string;
}

export interface Patent {
  id: string;
  title: string;
  patent_number: string;
  status: 'filed' | 'granted' | 'pending';
  abstract?: string;
  keywords?: string[];
  application_number?: string;
  publication_number?: string;
  inventors?: string[];
  applicants?: string[];
  assignees?: string[];
  filing_date?: string | null;
  priority_date?: string | null;
  publication_date?: string | null;
  grant_date?: string | null;
  patent_office?: string;
  family_id?: string;
  ipc_codes?: string[];
  cpc_codes?: string[];
  us_classifications?: string[];
  kind_code?: string;
  legal_status?: string;
  pct_number?: string;
  representative?: string;
  url?: string | null;
  drawings_url?: string | null;
  pdf_url?: string | null;
  forward_citations?: number;
  family_size?: number;
  publication_languages?: string[];
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  description: string;
}

export interface License {
  id: string;
  name: string;
  issuer: string;
  license_number?: string;
  awarded_date?: string | null;
  expiration_date?: string | null;
  date?: string | null;
  url?: string | null;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string;
  is_virtual?: boolean;
  date?: string | null;
  certificate_url?: string | null;
  description: string;
}

export interface TestScore {
  id: string;
  test_name: string;
  score: number | string;
  max_score?: number | null;
  percentile?: number | null;
  date?: string | null;
}

export type LanguageProficiencyLevel = 'basic' | 'conversational' | 'professional' | 'native';

export interface Language {
  language: string;
  read_proficiency: LanguageProficiencyLevel | '';
  write_proficiency: LanguageProficiencyLevel | '';
  speak_proficiency: LanguageProficiencyLevel | '';
  proficiency?: 'native' | 'full_professional' | 'limited_professional' | 'conversational' | 'basic';
  certification?: string;
}

export interface Organization {
  id: string;
  name: string;
  role: string;
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  description: string;
}

export interface Position {
  id: string;
  title: string;
  organization: string;
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  description: string;
}

export type CareerBreakReason = 'parental' | 'health' | 'travel' | 'education' | 'other';

export interface CareerBreak {
  id: string;
  start_date: string;
  end_date?: string | null;
  reason: CareerBreakReason | '';
  description: string;
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
  role_name: string;
  text: string;
}

export interface JobDescription {
  readonly id: string;
  role_name: string;
  text: string;
  readonly created_at: string; // ISO 8601
  readonly expires_at: string; // ISO 8601
}

// -------------------------------------------------
// Resume Generation Types
// -------------------------------------------------

export type GenerationStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

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
  sections: string[];
}

export interface ResumeSource {
  latex_source: string;
  modifications: string[];
}

export interface ProfileSaveEvent {
  sections: string[];
  saved_at: string;
  label: string;
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
