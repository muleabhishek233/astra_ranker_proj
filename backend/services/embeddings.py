# backend/services/embeddings.py
from google import genai
from typing import List

class EmbeddingService:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def generate_embedding(self, text: str) -> List[float]:
        response = self.client.models.embed_content(
            model="gemini-embedding-2-preview",
            contents=text
        )
        return response.embedding.values
