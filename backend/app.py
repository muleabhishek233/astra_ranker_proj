# backend/app.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import search, ranking

app = FastAPI(
    title="Intelligent Candidate Discovery & Ranking Engine API",
    description="Python FastAPI backend reference implementing Gemini parse-extract, Qdrant indexers, and hybrid co-scores matching.",
    version="1.0.0"
)

# CORS Enablement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Routers
app.include_router(ranking.router, prefix="/api", tags=["Ranking"])
app.include_router(search.router, prefix="/api", tags=["Copilot"])

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Candidate Ranking API Engine",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    # Bind to standard sandbox ports/hosts if run
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
