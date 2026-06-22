# backend/services/qdrant_service.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from typing import List, Dict, Any

class QdrantService:
    def __init__(self, url: str, api_key: str):
        # Qdrant Cloud client configuration
        self.client = QdrantClient(url=url, api_key=api_key)
        self.collection_name = "candidates"

    def recreate_collection(self, vector_size: int = 768):
        # Recreate collection configured for Cosine distance
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    def upsert_candidate(self, candidate_id: str, vector: List[float], payload: Dict[str, Any]):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=hash(candidate_id), # Numeric or UUID mappings
                    vector=vector,
                    payload={"candidate_id": candidate_id, **payload}
                )
            ]
        )

    def search_candidates(self, query_vector: List[float], limit: int = 100) -> List[Dict[str, Any]]:
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        return [hit.payload for hit in results]
