# backend/models/ranking.py
from pydantic import BaseModel
from typing import List, Optional
from backend.models.candidate import Candidate

class ParsedJobDescription(BaseModel):
    role: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_required: str
    industry: str
    education_requirements: List[str]
    work_mode: str
    salary_range: str

class ScoreBreakdown(BaseModel):
    skill_score: float
    experience_score: float
    semantic_score: float
    quality_score: float
    availability_score: float
    final_score: float

class CandidateExplanation(BaseModel):
    match_score: float
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    hiring_recommendation: str

class RankedCandidate(BaseModel):
    candidate: Candidate
    score: ScoreBreakdown
    explanation: CandidateExplanation
    interview_questions: List[str]
