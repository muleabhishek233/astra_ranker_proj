# backend/services/explanation_service.py
import json
from google import genai
from google.genai import types
from backend.models.candidate import Candidate
from backend.models.ranking import ParsedJobDescription, CandidateExplanation

class ExplanationService:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def generate_explanation(self, candidate: Candidate, jd: ParsedJobDescription, final_score: float) -> CandidateExplanation:
        prompt = f"""Evaluate the candidate's profile relative to the job requirements and overall matching score of {final_score}%.
CANDIDATE INFO:
Years of Experience: {candidate.profile.years_of_experience}
Headline: {candidate.profile.headline}
Skills: {[s.name for s in candidate.skills]}

JOB REQUIREMENTS:
Role: {jd.role}
Required Skills: {jd.required_skills}
Experience Required: {jd.experience_required}

Synthesize matching explanations focusing on Strengths, Gaps/Weaknesses, and Hiring Recommendations."""

        response = self.client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CandidateExplanation,
                temperature=0.2
            )
        )
        data = json.loads(response.text)
        return CandidateExplanation(**data)
