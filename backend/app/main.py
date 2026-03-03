from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from .services import ocr_service, ai_assistant, pdf_generator, tts_stt
from .models.database import get_db
from .routes import auth, documents, ai_routes

load_dotenv()

app = FastAPI(
    title="Rendix Vocal AI Assistant",
    description="Advanced Vocal AI Assistant for document processing and interaction",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["ai"])

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Rendix Vocal AI Assistant API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Rendix API"}
