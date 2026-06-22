# backend/services/jd_parser.py
import json
from google import genai
from google.genai import types
from backend.models.ranking import ParsedJobDescription

class JDParserService:
    def __init__(self, api_key: str):
        # Initialize Google GenAI client
        self.client = genai.Client(api_key=api_key)

    def parse_jd(self, jd_text: str) -> ParsedJobDescription:
        prompt = f"Parse the following Job Description (JD) and extract details into the specified schema:\n\n{jd_text}"
        
        # Call 'gemini-3.5-flash' using modern SDK schema structure
        response = self.client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedJobDescription,
                temperature=0.1
            )
        )
        data = json.loads(response.text)
        return ParsedJobDescription(**data)
