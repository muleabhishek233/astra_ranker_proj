# backend/services/interview_service.py
import json
from google import genai
from typing import List
from backend.models.candidate import Candidate
from backend.models.ranking import ParsedJobDescription

class InterviewQuestionService:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def generate_questions(self, candidate: Candidate, jd: ParsedJobDescription) -> List[str]:
        prompt = f"""Generate exactly 5 targeted, high-caliber interview questions designed for:
Candidate: {candidate.profile.anonymized_name} (headline: {candidate.profile.headline}, skills: {[s.name for s in candidate.skills]})
Applying for Role: {jd.role} (required: {jd.required_skills})

The questions must validate:
1. Primary skill competency
2. Historical project scale
3. Handling secondary preferred tools
4. Managing deficiencies or missing requirements
5. Situational capabilities

Format: Return a JSON array of strings containing exactly 5 questions."""

        response = self.client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        )
        return json.loads(response.text)
