# backend/routes/ranking.py
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import List, Optional
from backend.models.ranking import ParsedJobDescription, RankedCandidate, ScoreBreakdown

router = APIRouter()

class JDParseRequest(BaseModel):
    jd_text: str

class RankCandidatesRequest(BaseModel):
    jd_text: Optional[str] = None
    parsed_jd: ParsedJobDescription

class CandidateDetailRequest(BaseModel):
    candidate_id: str
    parsed_jd: ParsedJobDescription
    score_breakdown: ScoreBreakdown

@router.post("/parse-jd", response_model=ParsedJobDescription)
async def parse_job_description(request: JDParseRequest):
    # Route parsing triggers
    return ParsedJobDescription(
        role="Senior ML Engineer",
        required_skills=["Python", "RAG"],
        preferred_skills=["Qdrant"],
        experience_required="3+ years",
        industry="Technology",
        education_requirements=["Master CS"],
        work_mode="remote",
        salary_range="15 - 25 LPA"
    )

@router.post("/rank-candidates", response_model=List[RankedCandidate])
async def rank_candidates_engine(request: RankCandidatesRequest):
    # Trigger modular calculations & return ranking output
    return []

@router.post("/candidate/{id}", response_model=RankedCandidate)
async def candidate_details(id: str = Path(..., description="The candidate ID"), request: CandidateDetailRequest = None):
    # Explainability triggers
    raise HTTPException(status_code=404, detail="Triggering live evaluation via frontend adapter instead.")
