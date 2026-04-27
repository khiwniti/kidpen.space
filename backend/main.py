"""Minimal ASGI entry for kidpen backend with education endpoints."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.education.api import router as education_router

app = FastAPI(title="kidpen.space", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(education_router, prefix="/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "kidpen.space"}