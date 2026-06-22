/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candidate } from "../types";
import { NEW_CANDIDATES_PART1 } from "./new_candidates_part1";
import { NEW_CANDIDATES_PART2 } from "./new_candidates_part2";
import { NEW_CANDIDATES_PART3 } from "./new_candidates_part3";

export const CANDIDATES_DB: Candidate[] = [
  ...NEW_CANDIDATES_PART1,
  ...NEW_CANDIDATES_PART2,
  ...NEW_CANDIDATES_PART3,
  {
    candidate_id: "CAND_1000001",
    profile: {
      anonymized_name: "Abigail Miller",
      headline: "Senior AI Research & RAG Systems Architect",
      summary: "Passionate AI Specialist with over 6 years of experience building scalable Machine Learning pipelines, Large Language Model integrations, Retrieval-Augmented Generation (RAG) frameworks, and cloud-native intelligence microservices. Expert in neural search and vector database alignments.",
      location: "Bengaluru, Karnataka",
      country: "India",
      years_of_experience: 6.2,
      current_title: "Lead AI Engineer",
      current_company: "HyperScale Core AI",
      current_company_size: "51-200",
      current_industry: "Information Technology"
    },
    career_history: [
      {
        company: "HyperScale Core AI",
        title: "Lead AI Engineer",
        start_date: "2024-01-15",
        end_date: null,
        duration_months: 29,
        is_current: true,
        industry: "Information Technology",
        company_size: "51-200",
        description: "Leading the development of secure enterprise search and conversational agents. Architected custom RAG search pipelines using Qdrant and text-embedding models that improved document retrieval precision by 42%. Optimized prompt schemas and fine-tuned lightweight LLMs."
      },
      {
        company: "DeepMind Wave",
        title: "Senior ML Engineer",
        start_date: "2021-03-10",
        end_date: "2024-01-10",
        duration_months: 34,
        is_current: false,
        industry: "Technology",
        company_size: "201-500",
        description: "Engineered deep learning classifiers, semantic search microservices, and distributed text parsers in Python. Managed deployment of NLP APIs handling 10M+ daily requests."
      }
    ],
    education: [
      {
        institution: "Indian Institute of Technology (IIT) Madras",
        degree: "M.Tech",
        field_of_study: "Computer Science (AI & ML Specialization)",
        start_year: 2018,
        end_year: 2020,
        grade: "9.2 CGPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Python", proficiency: "expert", endorsements: 82, duration_months: 72 },
      { name: "RAG", proficiency: "expert", endorsements: 64, duration_months: 36 },
      { name: "LangChain", proficiency: "expert", endorsements: 51, duration_months: 30 },
      { name: "TensorFlow", proficiency: "advanced", endorsements: 44, duration_months: 48 },
      { name: "PyTorch", proficiency: "expert", endorsements: 59, duration_months: 50 },
      { name: "Qdrant", proficiency: "advanced", endorsements: 38, duration_months: 24 },
      { name: "PostgreSQL", proficiency: "intermediate", endorsements: 22, duration_months: 36 },
      { name: "Vector Search", proficiency: "expert", endorsements: 47, duration_months: 30 }
    ],
    certifications: [
      { name: "TensorFlow Certified Developer", issuer: "Google", year: 2021 },
      { name: "AWS Certified Machine Learning - Specialty", issuer: "Amazon Web Services", year: 2022 }
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Hindi", proficiency: "professional" }
    ],
    redrob_signals: {
      profile_completeness_score: 95,
      signup_date: "2021-01-12",
      last_active_date: "2026-06-19",
      open_to_work_flag: true,
      profile_views_received_30d: 184,
      applications_submitted_30d: 4,
      recruiter_response_rate: 0.95,
      avg_response_time_hours: 1.2,
      skill_assessment_scores: { "Python": 98, "Machine Learning": 95 },
      connection_count: 520,
      endorsements_received: 194,
      notice_period_days: 30,
      expected_salary_range_inr_lpa: { min: 28, max: 35 },
      preferred_work_mode: "remote",
      willing_to_relocate: true,
      github_activity_score: 92,
      search_appearance_30d: 412,
      saved_by_recruiters_30d: 18,
      interview_completion_rate: 0.98,
      offer_acceptance_rate: 0.90,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000002",
    profile: {
      anonymized_name: "Benjamin Carter",
      headline: "Senior Frontend Engineer | React | TypeScript | Tailwind CSS expert",
      summary: "Dedicated User Interface expert with 4.5 years of experience in designing responsive web applications, modular UI systems, and highly fluid user interactions. Proficient in styling methodologies, package bundlers, and front-tier performance tuning.",
      location: "Pune, Maharashtra",
      country: "India",
      years_of_experience: 4.5,
      current_title: "Senior UI Developer",
      current_company: "Stitch UI Solutions",
      current_company_size: "11-50",
      current_industry: "Design & Software development"
    },
    career_history: [
      {
        company: "Stitch UI Solutions",
        title: "Senior UI Developer",
        start_date: "2023-02-01",
        end_date: null,
        duration_months: 40,
        is_current: true,
        industry: "Design & Software development",
        company_size: "11-50",
        description: "Engineered robust design systems and reusable React+Tailwind component frameworks. Sped up runtime bundle compilation by 35% through custom asset-splitting configs. Mentored 3 junior front-end developers."
      },
      {
        company: "ByteCraft Web Labs",
        title: "Frontend Engineer",
        start_date: "2021-11-15",
        end_date: "2023-01-30",
        duration_months: 14,
        is_current: false,
        industry: "Tech Outsourcing",
        company_size: "11-50",
        description: "Implemented high-performance pixel-perfect dashboard elements, synchronized state managers using Redux, and enabled fluid micro-animations."
      }
    ],
    education: [
      {
        institution: "Pune University (COEP)",
        degree: "B.E. Computer Engineering",
        start_year: 2017,
        end_year: 2021,
        field_of_study: "Information Technology",
        grade: "8.5 CGPA",
        tier: "tier_2"
      }
    ],
    skills: [
      { name: "React", proficiency: "expert", endorsements: 76, duration_months: 50 },
      { name: "TypeScript", proficiency: "expert", endorsements: 62, duration_months: 45 },
      { name: "Tailwind CSS", proficiency: "expert", endorsements: 49, duration_months: 40 },
      { name: "JavaScript", proficiency: "expert", endorsements: 68, duration_months: 54 },
      { name: "Next.js", proficiency: "advanced", endorsements: 44, duration_months: 30 },
      { name: "Redux Toolkit", proficiency: "advanced", endorsements: 31, duration_months: 36 },
      { name: "Vite", proficiency: "advanced", endorsements: 28, duration_months: 24 }
    ],
    certifications: [
      { name: "Meta Frontend Developer Professional Certificate", issuer: "Meta", year: 2022 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Marathi", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 92,
      signup_date: "2021-11-20",
      last_active_date: "2026-06-20",
      open_to_work_flag: true,
      profile_views_received_30d: 94,
      applications_submitted_30d: 8,
      recruiter_response_rate: 0.88,
      avg_response_time_hours: 4.5,
      skill_assessment_scores: { "React": 94, "TypeScript": 90 },
      connection_count: 280,
      endorsements_received: 90,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 14, max: 18 },
      preferred_work_mode: "hybrid",
      willing_to_relocate: false,
      github_activity_score: 74,
      search_appearance_30d: 145,
      saved_by_recruiters_30d: 8,
      interview_completion_rate: 0.95,
      offer_acceptance_rate: 0.85,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000003",
    profile: {
      anonymized_name: "Christopher Vance",
      headline: "Principal Backend Architect | Go | Java | Kubernetes Systems Specialist",
      summary: "High-caliber backend cloud systems engineer with 8.5 years of experience in modeling robust relational database schemas, message-driven queue brokers, and resilient microservices. Expert in building low-latency API layers and distributed multi-tier nodes.",
      location: "San Jose, California",
      country: "United States",
      years_of_experience: 8.5,
      current_title: "Staff Software Engineer",
      current_company: "CloudVast Systems",
      current_company_size: "1001-5000",
      current_industry: "Cloud Infrastructure"
    },
    career_history: [
      {
        company: "CloudVast Systems",
        title: "Staff Software Engineer",
        start_date: "2022-05-15",
        end_date: null,
        duration_months: 49,
        is_current: true,
        industry: "Cloud Infrastructure",
        company_size: "1001-5000",
        description: "Re-engineered transactional ledger microservice in Go, reducing processing latency by 60ms. Led Kubernetes cluster deployments, multi-region database replications, and robust JWT-based federated auth schemes."
      },
      {
        company: "Apex Database Corp",
        title: "Senior Backend Developer",
        start_date: "2019-02-10",
        end_date: "2022-05-01",
        duration_months: 39,
        is_current: false,
        industry: "SaaS",
        company_size: "501-1000",
        description: "Designed resilient database triggers, complex analytical queries in PostgreSQL, and custom pub-sub event dispatchers in Java Spring Boot."
      }
    ],
    education: [
      {
        institution: "Stanford University",
        degree: "B.S. Computer Science",
        field_of_study: "Systems Engineering",
        start_year: 2013,
        end_year: 2017,
        grade: "A-",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Go", proficiency: "expert", endorsements: 88, duration_months: 60 },
      { name: "Java", proficiency: "expert", endorsements: 71, duration_months: 90 },
      { name: "Kubernetes", proficiency: "expert", endorsements: 63, duration_months: 48 },
      { name: "PostgreSQL", proficiency: "expert", endorsements: 75, duration_months: 80 },
      { name: "Docker", proficiency: "expert", endorsements: 64, duration_months: 60 },
      { name: "Python", proficiency: "advanced", endorsements: 44, duration_months: 50 },
      { name: "gRPC", proficiency: "expert", endorsements: 39, duration_months: 36 }
    ],
    certifications: [
      { name: "Certified Kubernetes Administrator (CKA)", issuer: "The Linux Foundation", year: 2021 }
    ],
    languages: [
      { language: "English", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 98,
      signup_date: "2018-08-11",
      last_active_date: "2026-06-20",
      open_to_work_flag: false,
      profile_views_received_30d: 290,
      applications_submitted_30d: 0,
      recruiter_response_rate: 0.76,
      avg_response_time_hours: 24,
      skill_assessment_scores: { "Go": 99, "Kubernetes": 96 },
      connection_count: 1204,
      endorsements_received: 245,
      notice_period_days: 90,
      expected_salary_range_inr_lpa: { min: 140, max: 180 }, // Recruiter LPA conversion (e.g., $170k to $220k relative)
      preferred_work_mode: "hybrid",
      willing_to_relocate: false,
      github_activity_score: 86,
      search_appearance_30d: 780,
      saved_by_recruiters_30d: 32,
      interview_completion_rate: 0.90,
      offer_acceptance_rate: 0.70,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000004",
    profile: {
      anonymized_name: "Daniel Alvarez",
      headline: "DevOps & Cloud Security Architect | AWS | Terraform | Python",
      summary: "DevOps specialist with 5.1 years of experience implementing secure cloud pipelines, IaC scripting, secrets configurations, and automated server scaling processes. Seasoned in reducing cloud expenditures and reinforcing zero-trust access control.",
      location: "Austin, Texas",
      country: "United States",
      years_of_experience: 5.1,
      current_title: "Senior DevOps Architect",
      current_company: "Securily Network",
      current_company_size: "201-500",
      current_industry: "Computer & Network Security"
    },
    career_history: [
      {
        company: "Securily Network",
        title: "Senior DevOps Architect",
        start_date: "2023-05-10",
        end_date: null,
        duration_months: 37,
        is_current: true,
        industry: "Computer & Network Security",
        company_size: "201-500",
        description: "Restructured the core cloud infrastructure to rely entirely on automated Terraform templates. Setup centralized secret-stores, restricted firewall mappings, and optimized daily build servers reducing deploy-times from 40m to 12m."
      },
      {
        company: "Vortex Gaming",
        title: "Site Reliability Engineer",
        start_date: "2021-02-15",
        end_date: "2023-05-01",
        duration_months: 26,
        is_current: false,
        industry: "Entertainment",
        company_size: "501-1000",
        description: "Monitored distributed multiplayer cluster operations on AWS. Setup robust monitoring logs, Prometheus alarms, and shell utilities in Python."
      }
    ],
    education: [
      {
        institution: "University of Texas at Austin",
        degree: "B.S. Computer Engineering",
        field_of_study: "Embedded Systems & Security",
        start_year: 2016,
        end_year: 2020,
        grade: "3.7 GPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "AWS", proficiency: "expert", endorsements: 62, duration_months: 60 },
      { name: "Terraform", proficiency: "expert", endorsements: 53, duration_months: 40 },
      { name: "Python", proficiency: "advanced", endorsements: 41, duration_months: 50 },
      { name: "Docker", proficiency: "advanced", endorsements: 39, duration_months: 45 },
      { name: "CI/CD", proficiency: "expert", endorsements: 48, duration_months: 48 },
      { name: "Prometheus", proficiency: "intermediate", endorsements: 18, duration_months: 24 }
    ],
    certifications: [
      { name: "AWS Certified Solutions Architect - Professional", issuer: "AWS", year: 2022 },
      { name: "HashiCorp Certified - Terraform Associate", issuer: "HashiCorp", year: 2021 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Spanish", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 93,
      signup_date: "2020-07-15",
      last_active_date: "2026-06-18",
      open_to_work_flag: true,
      profile_views_received_30d: 110,
      applications_submitted_30d: 6,
      recruiter_response_rate: 0.92,
      avg_response_time_hours: 1.8,
      skill_assessment_scores: { "AWS": 95, "Terraform": 92 },
      connection_count: 411,
      endorsements_received: 102,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 110, max: 135 },
      preferred_work_mode: "remote",
      willing_to_relocate: true,
      github_activity_score: 55,
      search_appearance_30d: 260,
      saved_by_recruiters_30d: 14,
      interview_completion_rate: 0.94,
      offer_acceptance_rate: 0.88,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000005",
    profile: {
      anonymized_name: "Eleanor Vance",
      headline: "Full Stack Engineer | React | Express | Node | Python Specialist",
      summary: "Versatile Full Stack Software Engineer with 3.2 years of professional background. Skilled in combining intuitive frontend elements with modular Node.js/Express server designs, SQL/NoSQL storage structures, and custom API gateways. Passionate about rapid feature iterations.",
      location: "New Delhi, Delhi",
      country: "India",
      years_of_experience: 3.2,
      current_title: "Full Stack Developer",
      current_company: "RapidSprint SaaS",
      current_company_size: "11-50",
      current_industry: "Internet Services"
    },
    career_history: [
      {
        company: "RapidSprint SaaS",
        title: "Full Stack Developer",
        start_date: "2023-01-10",
        end_date: null,
        duration_months: 41,
        is_current: true,
        industry: "Internet Services",
        company_size: "11-50",
        description: "Maintaining fully fluid dashboard products. Constructed microservice API structures, configured local security middleware rules, and enabled rapid search databases. Linked payment webhooks and custom analytics tracking dashboards."
      },
      {
        company: "CodeAero Devs",
        title: "Software Engineer Trainee",
        start_date: "2021-12-01",
        end_date: "2022-12-30",
        duration_months: 12,
        is_current: false,
        industry: "Software Agency",
        company_size: "1-10",
        description: "Engaged in client-specific web systems design, basic Node routing tasks, and general browser rendering optimizations in standard React CSS modules."
      }
    ],
    education: [
      {
        institution: "Delhi Technological University (DTU)",
        degree: "B.Tech Computer Science",
        field_of_study: "Software Engineering",
        start_year: 2017,
        end_year: 2021,
        grade: "8.1 CGPA",
        tier: "tier_2"
      }
    ],
    skills: [
      { name: "React", proficiency: "advanced", endorsements: 32, duration_months: 30 },
      { name: "Node.js", proficiency: "advanced", endorsements: 28, duration_months: 30 },
      { name: "Express", proficiency: "advanced", endorsements: 25, duration_months: 24 },
      { name: "JavaScript", proficiency: "expert", endorsements: 44, duration_months: 38 },
      { name: "Python", proficiency: "intermediate", endorsements: 18, duration_months: 18 },
      { name: "PostgreSQL", proficiency: "intermediate", endorsements: 15, duration_months: 20 },
      { name: "MongoDB", proficiency: "intermediate", endorsements: 12, duration_months: 15 }
    ],
    certifications: [
      { name: "Full Stack Javascript Certification", issuer: "Udacity", year: 2022 }
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Hindi", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 90,
      signup_date: "2021-10-01",
      last_active_date: "2026-06-20",
      open_to_work_flag: true,
      profile_views_received_30d: 48,
      applications_submitted_30d: 12,
      recruiter_response_rate: 0.90,
      avg_response_time_hours: 2.1,
      skill_assessment_scores: { "React": 88, "Node.js": 85 },
      connection_count: 145,
      endorsements_received: 38,
      notice_period_days: 0,
      expected_salary_range_inr_lpa: { min: 8, max: 11 },
      preferred_work_mode: "remote",
      willing_to_relocate: true,
      github_activity_score: 82,
      search_appearance_30d: 78,
      saved_by_recruiters_30d: 4,
      interview_completion_rate: 1.0,
      offer_acceptance_rate: 0.90,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000006",
    profile: {
      anonymized_name: "Franklin Harris",
      headline: "Machine Learning Engineer | Data Scientist | Stats & Deep Learning",
      summary: "Data Expert with 5.5 years of experience deploying prediction models in PyTorch, cleaning analytical datasets in Pandas, building custom Scikit-learn pipelines, and setting up clean visual reporting systems.",
      location: "Hyderabad, Telangana",
      country: "India",
      years_of_experience: 5.5,
      current_title: "Senior ML Research Engineer",
      current_company: "Apex Analytics",
      current_company_size: "201-500",
      current_industry: "Financial Services"
    },
    career_history: [
      {
        company: "Apex Analytics",
        title: "Senior ML Research Engineer",
        start_date: "2022-10-01",
        end_date: null,
        duration_months: 44,
        is_current: true,
        industry: "Financial Services",
        company_size: "201-500",
        description: "Deployed structural classification models that flags credit defaults with 94.5% accuracy. Unified sparse time-series analytical databases, optimizing retrieval schemas and indexing keys."
      },
      {
        company: "Global Capital Research",
        title: "ML Associate",
        start_date: "2020-08-15",
        end_date: "2022-09-30",
        duration_months: 25,
        is_current: false,
        industry: "Financial Services",
        company_size: "1001-5000",
        description: "Engaged in quantitative statistics, python cleanups, scikit modeling, regression tests, and basic pandas aggregations of financial reports."
      }
    ],
    education: [
      {
        institution: "BITS Pilani",
        degree: "B.E. Computer Science",
        field_of_study: "Information Retrieval & Math",
        start_year: 2016,
        end_year: 2020,
        grade: "8.8 CGPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Python", proficiency: "expert", endorsements: 68, duration_months: 66 },
      { name: "PyTorch", proficiency: "expert", endorsements: 44, duration_months: 40 },
      { name: "Scikit-learn", proficiency: "expert", endorsements: 41, duration_months: 48 },
      { name: "SQL", proficiency: "advanced", endorsements: 38, duration_months: 50 },
      { name: "Pandas", proficiency: "expert", endorsements: 52, duration_months: 60 },
      { name: "RAG", proficiency: "beginner", endorsements: 4, duration_months: 6 }
    ],
    certifications: [
      { name: "Advanced Data Science Core", issuer: "Coursera / IBM", year: 2021 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Telugu", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 91,
      signup_date: "2020-05-10",
      last_active_date: "2026-06-19",
      open_to_work_flag: true,
      profile_views_received_30d: 74,
      applications_submitted_30d: 3,
      recruiter_response_rate: 0.85,
      avg_response_time_hours: 3.5,
      skill_assessment_scores: { "Python": 92, "Machine Learning": 89 },
      connection_count: 310,
      endorsements_received: 68,
      notice_period_days: 30,
      expected_salary_range_inr_lpa: { min: 20, max: 25 },
      preferred_work_mode: "hybrid",
      willing_to_relocate: true,
      github_activity_score: 64,
      search_appearance_30d: 122,
      saved_by_recruiters_30d: 6,
      interview_completion_rate: 0.92,
      offer_acceptance_rate: 0.80,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000007",
    profile: {
      anonymized_name: "Grace Hopper II",
      headline: "Associate Frontend Developer | React | Graduate Engineer",
      summary: "Passionate entry-level computer engineer specialized in CSS layouts, basic React.js architectures, modern ES6 syntax, and semantic HTML systems. Eager to grow inside a fast scalability SaaS structure.",
      location: "Chennai, Tamil Nadu",
      country: "India",
      years_of_experience: 1.2,
      current_title: "Associate React Engineer",
      current_company: "BrightDev Solutions",
      current_company_size: "11-50",
      current_industry: "Software"
    },
    career_history: [
      {
        company: "BrightDev Solutions",
        title: "Associate React Engineer",
        start_date: "2025-05-01",
        end_date: null,
        duration_months: 13,
        is_current: true,
        industry: "Software",
        company_size: "11-50",
        description: "Responsible for crafting responsive component states, resolving visual UI bugs, aligning and styling pages with Tailwind CSS utility mappings, and verifying dynamic form inputs."
      }
    ],
    education: [
      {
        institution: "Anna University",
        degree: "B.Tech Information Technology",
        field_of_study: "Computer Engineering",
        start_year: 2021,
        end_year: 2025,
        grade: "8.2 CGPA",
        tier: "tier_2"
      }
    ],
    skills: [
      { name: "React", proficiency: "intermediate", endorsements: 12, duration_months: 15 },
      { name: "Tailwind CSS", proficiency: "advanced", endorsements: 19, duration_months: 15 },
      { name: "JavaScript", proficiency: "intermediate", endorsements: 15, duration_months: 18 },
      { name: "HTML", proficiency: "expert", endorsements: 22, duration_months: 24 },
      { name: "CSS", proficiency: "advanced", endorsements: 18, duration_months: 24 }
    ],
    certifications: [
      { name: "Responsive Web Design", issuer: "freeCodeCamp", year: 2024 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Tamil", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 85,
      signup_date: "2024-06-01",
      last_active_date: "2026-06-20",
      open_to_work_flag: true,
      profile_views_received_30d: 32,
      applications_submitted_30d: 25,
      recruiter_response_rate: 0.94,
      avg_response_time_hours: 1.0,
      skill_assessment_scores: { "React": 72, "Tailwind CSS": 80 },
      connection_count: 85,
      endorsements_received: 12,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 5, max: 7 },
      preferred_work_mode: "onsite",
      willing_to_relocate: true,
      github_activity_score: 71,
      search_appearance_30d: 41,
      saved_by_recruiters_30d: 2,
      interview_completion_rate: 1.0,
      offer_acceptance_rate: 0.95,
      verified_email: true,
      verified_phone: false,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000008",
    profile: {
      anonymized_name: "Harrison Ford II",
      headline: "Technical Product Manager | Agile Systems Leader",
      summary: "Dynamic Technical Product Lead with 7+ years of experience aligning engineering roadmaps, scoping software user stories, launching web platforms, and coordinate cross-functional teams in high-speed settings.",
      location: "San Francisco, California",
      country: "United States",
      years_of_experience: 7.2,
      current_title: "Technical Product Manager",
      current_company: "GrowthStack Technologies",
      current_company_size: "201-500",
      current_industry: "Software & Technology"
    },
    career_history: [
      {
        company: "GrowthStack Technologies",
        title: "Technical Product Manager",
        start_date: "2022-08-01",
        end_date: null,
        duration_months: 46,
        is_current: true,
        industry: "Software & Technology",
        company_size: "201-500",
        description: "Scoping core feature sets and technical specifications for SaaS analytics dashboards. Managed product backlogs in Jira, leading scrum cycles, and collaborating directly with staff front-tier and ML engineers."
      },
      {
        company: "InnoBuild Platforms",
        title: "Product Analyst",
        start_date: "2019-03-10",
        end_date: "2022-07-28",
        duration_months: 40,
        is_current: false,
        industry: "SaaS",
        company_size: "51-200",
        description: "Analyzed product usage loops using Amplitude, compiled customer requests, wrote complex user requirements, and handled QA releases."
      }
    ],
    education: [
      {
        institution: "UC Berkeley",
        degree: "B.A. Economics & Computer Science",
        field_of_study: "Information Management",
        start_year: 2015,
        end_year: 2019,
        grade: "3.6 GPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Agile", proficiency: "expert", endorsements: 54, duration_months: 80 },
      { name: "Jira", proficiency: "expert", endorsements: 48, duration_months: 70 },
      { name: "Product Strategy", proficiency: "expert", endorsements: 44, duration_months: 60 },
      { name: "Python", proficiency: "beginner", endorsements: 8, duration_months: 12 },
      { name: "SQL", proficiency: "intermediate", endorsements: 19, duration_months: 30 },
      { name: "React", proficiency: "beginner", endorsements: 5, duration_months: 12 }
    ],
    certifications: [
      { name: "Certified Scrum Product Owner (CSPO)", issuer: "Scrum Alliance", year: 2021 }
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Spanish", proficiency: "conversational" }
    ],
    redrob_signals: {
      profile_completeness_score: 94,
      signup_date: "2019-01-10",
      last_active_date: "2026-06-19",
      open_to_work_flag: false,
      profile_views_received_30d: 140,
      applications_submitted_30d: 0,
      recruiter_response_rate: 0.65,
      avg_response_time_hours: 48,
      skill_assessment_scores: { "Product Management": 95 },
      connection_count: 850,
      endorsements_received: 122,
      notice_period_days: 60,
      expected_salary_range_inr_lpa: { min: 110, max: 130 },
      preferred_work_mode: "hybrid",
      willing_to_relocate: false,
      github_activity_score: -1,
      search_appearance_30d: 310,
      saved_by_recruiters_30d: 12,
      interview_completion_rate: 0.88,
      offer_acceptance_rate: 0.75,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000009",
    profile: {
      anonymized_name: "Isabella Martinez",
      headline: "Senior QA Automation Engineer | Selenium, Cypress, Node.js",
      summary: "Detail-oriented QA Automation developer with 4.2 years of exp scaling automated integration run-scripts, scripting assertions in Javascript, and managing performance latency locks.",
      location: "Bengaluru, Karnataka",
      country: "India",
      years_of_experience: 4.2,
      current_title: "Senior QA Engineer",
      current_company: "Apex Assurance Labs",
      current_company_size: "51-200",
      current_industry: "Quality Engineering"
    },
    career_history: [
      {
        company: "Apex Assurance Labs",
        title: "Senior QA Engineer",
        start_date: "2023-01-05",
        end_date: null,
        duration_months: 41,
        is_current: true,
        industry: "Quality Engineering",
        company_size: "51-200",
        description: "Authoring full Cypress E2E functional sequences and Mocha regression suites. Cut build validation times in CI/CD by 50% via parallel automation runs. Established visual test regressions."
      },
      {
        company: "LogiValidate",
        title: "Testing Executive",
        start_date: "2022-04-10",
        end_date: "2022-12-30",
        duration_months: 8,
        is_current: false,
        industry: "IT Service provider",
        company_size: "501-1000",
        description: "Conducted manual browser sanity tasks, logged Jira tickets, and scripted basic Selenium automation test cases."
      }
    ],
    education: [
      {
        institution: "Anna University",
        degree: "B.E. Computer Engineering",
        field_of_study: "Information Retrieval",
        start_year: 2018,
        end_year: 2022,
        grade: "8.3 CGPA",
        tier: "tier_2"
      }
    ],
    skills: [
      { name: "Cypress", proficiency: "expert", endorsements: 44, duration_months: 36 },
      { name: "Selenium", proficiency: "advanced", endorsements: 31, duration_months: 40 },
      { name: "JavaScript", proficiency: "advanced", endorsements: 28, duration_months: 42 },
      { name: "Python", proficiency: "intermediate", endorsements: 12, duration_months: 18 },
      { name: "PostgreSQL", proficiency: "intermediate", endorsements: 9, duration_months: 15 }
    ],
    certifications: [
      { name: "ISTQB Certified Tester", issuer: "ISTQB", year: 2022 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Spanish", proficiency: "conversational" }
    ],
    redrob_signals: {
      profile_completeness_score: 89,
      signup_date: "2022-01-12",
      last_active_date: "2026-06-20",
      open_to_work_flag: true,
      profile_views_received_30d: 58,
      applications_submitted_30d: 14,
      recruiter_response_rate: 0.91,
      avg_response_time_hours: 1.5,
      skill_assessment_scores: { "Cypress": 96, "Testing": 92 },
      connection_count: 140,
      endorsements_received: 44,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 10, max: 13 },
      preferred_work_mode: "hybrid",
      willing_to_relocate: true,
      github_activity_score: 41,
      search_appearance_30d: 92,
      saved_by_recruiters_30d: 5,
      interview_completion_rate: 1.0,
      offer_acceptance_rate: 0.85,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: true
    }
  },
  {
    candidate_id: "CAND_1000010",
    profile: {
      anonymized_name: "James Gosling II",
      headline: "Backend Python Engineer | Django / FastAPI microservices",
      summary: "Python software developer with 2.1 years of professional experience modeling FastAPI routes, connecting SQL tables, resolving data migrations, and pushing secure endpoints.",
      location: "Bengaluru, Karnataka",
      country: "India",
      years_of_experience: 2.1,
      current_title: "Associate Systems Engineer",
      current_company: "FastFlow Technologies",
      current_company_size: "11-50",
      current_industry: "Software SaaS"
    },
    career_history: [
      {
        company: "FastFlow Technologies",
        title: "Associate Systems Engineer",
        start_date: "2024-05-10",
        end_date: null,
        duration_months: 25,
        is_current: true,
        industry: "Software SaaS",
        company_size: "11-50",
        description: "Responsible for coding RESTful application layers in Django and FastAPI, optimizing relational SQL joins, tracking celery execution nodes, and adding unit tests."
      }
    ],
    education: [
      {
        institution: "IIT Roorkee",
        degree: "B.Tech Computer Science",
        field_of_study: "Software Engineering",
        start_year: 2020,
        end_year: 2024,
        grade: "8.4 CGPA",
        tier: "tier_1"
      }
    ],
    skills: [
      { name: "Python", proficiency: "advanced", endorsements: 29, duration_months: 24 },
      { name: "FastAPI", proficiency: "advanced", endorsements: 21, duration_months: 18 },
      { name: "Django", proficiency: "intermediate", endorsements: 14, duration_months: 15 },
      { name: "SQL", proficiency: "intermediate", endorsements: 18, duration_months: 24 },
      { name: "PostgreSQL", proficiency: "intermediate", endorsements: 11, duration_months: 18 }
    ],
    certifications: [
      { name: "Programming in Python Specialist", issuer: "Python Institute", year: 2023 }
    ],
    languages: [
      { language: "English", proficiency: "professional" },
      { language: "Hindi", proficiency: "native" }
    ],
    redrob_signals: {
      profile_completeness_score: 88,
      signup_date: "2023-11-15",
      last_active_date: "2026-06-20",
      open_to_work_flag: true,
      profile_views_received_30d: 65,
      applications_submitted_30d: 19,
      recruiter_response_rate: 0.96,
      avg_response_time_hours: 0.8,
      skill_assessment_scores: { "Python": 89, "FastAPI": 84 },
      connection_count: 110,
      endorsements_received: 29,
      notice_period_days: 15,
      expected_salary_range_inr_lpa: { min: 8, max: 11 },
      preferred_work_mode: "remote",
      willing_to_relocate: true,
      github_activity_score: 78,
      search_appearance_30d: 112,
      saved_by_recruiters_30d: 6,
      interview_completion_rate: 1.0,
      offer_acceptance_rate: 0.90,
      verified_email: true,
      verified_phone: true,
      linkedin_connected: false
    }
  }
];

export function candidate_to_text(candidate: Candidate): string {
  const profile = candidate.profile;
  const headline = profile.headline || "";
  const summary = profile.summary || "";
  const skillsText = candidate.skills.map(s => `${s.name} (${s.proficiency})`).join(", ");
  
  const historyText = candidate.career_history.map(c => 
    `${c.title} at ${c.company} in ${c.industry} industry: ${c.description}`
  ).join(". ");

  const eduText = candidate.education.map(e => 
    `${e.degree} in ${e.field_of_study} from ${e.institution}`
  ).join(". ");

  const certsText = candidate.certifications ? 
    candidate.certifications.map(c => `${c.name} issued by ${c.issuer}`).join(", ") : "";

  return `Candidate [Headline: ${headline}]. [Summary: ${summary}]. [Experience: ${profile.years_of_experience} years]. [Current Title: ${profile.current_title} at ${profile.current_company} in ${profile.current_industry}]. [Skills: ${skillsText}]. [Career History: ${historyText}]. [Education: ${eduText}]. [Certifications: ${certsText}].`;
}
