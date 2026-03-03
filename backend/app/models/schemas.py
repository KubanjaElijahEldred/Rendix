from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(UserCreate):
    confirm_password: str

# Document schemas
class DocumentBase(BaseModel):
    title: str
    filename: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    processing_status: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    file_size: Optional[int]
    mime_type: Optional[str]
    extracted_text: Optional[str]
    ocr_confidence: Optional[int]
    word_count: Optional[int]
    char_count: Optional[int]
    processing_status: str
    processing_error: Optional[str]
    created_at: datetime
    updated_at: datetime
    owner_id: int
    
    class Config:
        from_attributes = True

# AI Interaction schemas
class AIInteractionBase(BaseModel):
    interaction_type: str
    input_text: Optional[str] = None
    output_text: Optional[str] = None
    language: Optional[str] = None

class AIInteractionCreate(AIInteractionBase):
    document_id: Optional[int] = None

class AIInteractionResponse(AIInteractionBase):
    id: int
    tokens_used: Optional[int]
    model_used: Optional[str]
    processing_time: Optional[int]
    success: bool
    error_message: Optional[str]
    created_at: datetime
    document_id: Optional[int]
    user_id: int
    
    class Config:
        from_attributes = True

# OCR schemas
class OCRRequest(BaseModel):
    document_id: int

class OCRResponse(BaseModel):
    success: bool
    text: str
    confidence: float
    word_count: int
    char_count: int
    error: Optional[str] = None

# AI Assistant schemas
class ExplainRequest(BaseModel):
    text: str
    context: Optional[str] = None
    document_id: Optional[int] = None

class ExplainResponse(BaseModel):
    success: bool
    explanation: str
    tokens_used: Optional[int]
    model: Optional[str]
    error: Optional[str] = None

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "English"
    document_id: Optional[int] = None

class TranslateResponse(BaseModel):
    success: bool
    translation: str
    source_language: Optional[str]
    target_language: str
    tokens_used: Optional[int]
    error: Optional[str] = None

class ReportRequest(BaseModel):
    data: str
    report_type: str = "summary"
    document_id: Optional[int] = None

class ReportResponse(BaseModel):
    success: bool
    report: str
    report_type: str
    tokens_used: Optional[int]
    error: Optional[str] = None

# TTS/STT schemas
class TTSRequest(BaseModel):
    text: str
    voice_id: str = "Rachel"
    provider: str = "elevenlabs"  # elevenlabs or openai

class TTSResponse(BaseModel):
    success: bool
    audio_data: str  # base64 encoded
    format: str
    voice_id: Optional[str]
    provider: Optional[str]
    text_length: int
    duration_estimate: Optional[float]
    error: Optional[str] = None

class STTRequest(BaseModel):
    provider: str = "whisper"  # whisper or openai
    language: str = "en"

class STTResponse(BaseModel):
    success: bool
    transcription: str
    language_detected: Optional[str]
    confidence: Optional[float]
    duration: Optional[float]
    provider: Optional[str]
    error: Optional[str] = None

class VoicesResponse(BaseModel):
    success: bool
    voices: List[dict]
    total_count: int
    error: Optional[str] = None

# PDF schemas
class PDFRequest(BaseModel):
    text: str
    title: str = "Rendix Document"
    author: str = "Rendix AI"

class PDFResponse(BaseModel):
    success: bool
    pdf_data: str  # base64 encoded
    title: str
    error: Optional[str] = None

class SignPDFRequest(BaseModel):
    pdf_data: str  # base64 encoded
    signature_text: str
    signatory_name: str = "User"

class SignPDFResponse(BaseModel):
    success: bool
    signed_pdf_data: str  # base64 encoded
    error: Optional[str] = None

# Generic response schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    success: bool = False
    details: Optional[str] = None
