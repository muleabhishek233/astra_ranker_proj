/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Candidate Dataset Types ---

export interface CandidateProfile {
  anonymized_name: string;
  headline: string;
  summary: string;
  location: string;
  country: string;
  years_of_experience: number;
  current_title: string;
  current_company: string;
  current_company_size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1001-5000" | "5001-10000" | "10001+";
  current_industry: string;
}

export interface CareerHistoryItem {
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  duration_months: number;
  is_current: boolean;
  industry: string;
  company_size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1001-5000" | "5001-10000" | "10001+";
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  grade: string | null;
  tier: "tier_1" | "tier_2" | "tier_3" | "tier_4" | "unknown";
}

export interface SkillItem {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  endorsements: number;
  duration_months: number;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: number;
}

export interface LanguageItem {
  language: string;
  proficiency: "basic" | "conversational" | "professional" | "native";
}

export interface ExpectedSalaryRange {
  min: number;
  max: number;
}

export interface RedrobSignals {
  profile_completeness_score: number;
  signup_date: string;
  last_active_date: string;
  open_to_work_flag: boolean;
  profile_views_received_30d: number;
  applications_submitted_30d: number;
  recruiter_response_rate: number;
  avg_response_time_hours: number;
  skill_assessment_scores: Record<string, number>;
  connection_count: number;
  endorsements_received: number;
  notice_period_days: number;
  expected_salary_range_inr_lpa: ExpectedSalaryRange;
  preferred_work_mode: "remote" | "hybrid" | "onsite" | "flexible";
  willing_to_relocate: boolean;
  github_activity_score: number;
  search_appearance_30d: number;
  saved_by_recruiters_30d: number;
  interview_completion_rate: number;
  offer_acceptance_rate: number;
  verified_email: boolean;
  verified_phone: boolean;
  linkedin_connected: boolean;
}

export interface Candidate {
  candidate_id: string; // Matches CAND_XXXXXXX
  profile: CandidateProfile;
  career_history: CareerHistoryItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  redrob_signals: RedrobSignals;
}

// --- JD Parser Output ---

export interface ParsedJobDescription {
  role: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_required: string; // e.g., "5+ years"
  industry: string;
  education_requirements: string[];
  work_mode: "remote" | "hybrid" | "onsite" | "flexible" | "any";
  salary_range: string;
}

// --- Hybrid Ranking Score Details ---

export interface ScoreBreakdown {
  skill_score: number;        // Weight: 35%
  experience_score: number;   // Weight: 20%
  semantic_score: number;     // Weight: 20%
  quality_score: number;      // Weight: 15%
  availability_score: number; // Weight: 10%
  final_score: number;        // Aggregated hybrid score (0 to 100)
}

// --- Explainability Outputs ---

export interface CandidateExplanation {
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  hiring_recommendation: string;
}

// --- Complete Ranked Candidate Representation ---

export interface RankedCandidate {
  candidate: Candidate;
  score: ScoreBreakdown;
  explanation: CandidateExplanation;
  interview_questions: string[]; // Personalized 5 interview questions
}

// --- Copilot Recruiter Context ---

export interface CopilotFilter {
  roles?: string[];
  skills?: string[];
  min_experience?: number;
  work_mode?: "remote" | "hybrid" | "onsite" | "flexible" | "any";
  industry?: string;
}

export interface CopilotRequest {
  query: string;
  jobDescriptionContext?: ParsedJobDescription;
}

export interface CopilotResponse {
  natural_interpretation: string;
  filters_applied: CopilotFilter;
  ranked_candidates: RankedCandidate[];
}
