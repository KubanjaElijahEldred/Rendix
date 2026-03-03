from fastapi import APIRouter, Depends, HTTPException, status, File
from sqlalchemy.orm import Session
from datetime import datetime
import base64

from ..models.database import get_db, User, Document, AIInteraction
from ..models.schemas import (
    ExplainRequest, ExplainResponse, TranslateRequest, TranslateResponse,
    ReportRequest, ReportResponse, TTSRequest, TTSResponse, STTRequest,
    STTResponse, VoicesResponse, PDFRequest, PDFResponse, SignPDFRequest,
    SignPDFResponse
)
from ..utils.auth import get_current_active_user
from ..services.ai_assistant import ai_assistant
from ..services.tts_stt import tts_stt_service
from ..services.pdf_generator import pdf_generator

router = APIRouter()

@router.post("/explain", response_model=ExplainResponse)
async def explain_text(
    request: ExplainRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Explain text using AI"""
    
    try:
        # Process explanation
        result = await ai_assistant.explain_text(request.text, request.context)
        
        if result["success"]:
            # Log interaction
            interaction = AIInteraction(
                interaction_type="explain",
                input_text=request.text,
                output_text=result["explanation"],
                tokens_used=result.get("tokens_used"),
                model_used=result.get("model"),
                user_id=current_user.id,
                document_id=request.document_id,
                success=True
            )
            db.add(interaction)
            db.commit()
            
            return ExplainResponse(
                success=True,
                explanation=result["explanation"],
                tokens_used=result.get("tokens_used"),
                model=result.get("model")
            )
        else:
            # Log failed interaction
            interaction = AIInteraction(
                interaction_type="explain",
                input_text=request.text,
                user_id=current_user.id,
                document_id=request.document_id,
                success=False,
                error_message=result["error"]
            )
            db.add(interaction)
            db.commit()
            
            return ExplainResponse(
                success=False,
                explanation="",
                error=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explanation failed: {str(e)}"
        )

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Translate text using AI"""
    
    try:
        # Process translation
        result = await ai_assistant.translate_text(request.text, request.target_language)
        
        if result["success"]:
            # Log interaction
            interaction = AIInteraction(
                interaction_type="translate",
                input_text=request.text,
                output_text=result["translation"],
                language=request.target_language,
                tokens_used=result.get("tokens_used"),
                user_id=current_user.id,
                document_id=request.document_id,
                success=True
            )
            db.add(interaction)
            db.commit()
            
            return TranslateResponse(
                success=True,
                translation=result["translation"],
                source_language=result.get("source_language"),
                target_language=result["target_language"],
                tokens_used=result.get("tokens_used")
            )
        else:
            # Log failed interaction
            interaction = AIInteraction(
                interaction_type="translate",
                input_text=request.text,
                language=request.target_language,
                user_id=current_user.id,
                document_id=request.document_id,
                success=False,
                error_message=result["error"]
            )
            db.add(interaction)
            db.commit()
            
            return TranslateResponse(
                success=False,
                translation="",
                error=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )

@router.post("/report", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a report using AI"""
    
    try:
        # Process report generation
        result = await ai_assistant.generate_report(request.data, request.report_type)
        
        if result["success"]:
            # Log interaction
            interaction = AIInteraction(
                interaction_type="report",
                input_text=request.data,
                output_text=result["report"],
                tokens_used=result.get("tokens_used"),
                model_used=result.get("model"),
                user_id=current_user.id,
                document_id=request.document_id,
                success=True
            )
            db.add(interaction)
            db.commit()
            
            return ReportResponse(
                success=True,
                report=result["report"],
                report_type=request.report_type,
                tokens_used=result.get("tokens_used")
            )
        else:
            # Log failed interaction
            interaction = AIInteraction(
                interaction_type="report",
                input_text=request.data,
                user_id=current_user.id,
                document_id=request.document_id,
                success=False,
                error_message=result["error"]
            )
            db.add(interaction)
            db.commit()
            
            return ReportResponse(
                success=False,
                report="",
                error=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
        )

@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Convert text to speech"""
    
    try:
        if request.provider == "elevenlabs":
            result = await tts_stt_service.text_to_speech(request.text, request.voice_id)
        else:
            result = await tts_stt_service.openai_tts(request.text, request.voice_id)
        
        return TTSResponse(
            success=result["success"],
            audio_data=result["audio_data"],
            format=result["format"],
            voice_id=result.get("voice_id"),
            provider=result.get("provider"),
            text_length=result.get("text_length", len(request.text)),
            duration_estimate=result.get("duration_estimate"),
            error=result.get("error")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TTS failed: {str(e)}"
        )

@router.post("/stt", response_model=STTResponse)
async def speech_to_text(
    audio_data: bytes = File(...),
    provider: str = "whisper",
    language: str = "en",
    current_user: User = Depends(get_current_active_user)
):
    """Convert speech to text"""
    
    try:
        if provider == "whisper":
            result = await tts_stt_service.speech_to_text(audio_data, language)
        else:
            result = await tts_stt_service.openai_stt(audio_data, language)
        
        return STTResponse(
            success=result["success"],
            transcription=result["transcription"],
            language_detected=result.get("language_detected"),
            confidence=result.get("confidence"),
            duration=result.get("duration"),
            provider=result.get("provider"),
            error=result.get("error")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"STT failed: {str(e)}"
        )

@router.get("/voices", response_model=VoicesResponse)
async def get_available_voices():
    """Get available TTS voices"""
    
    try:
        result = await tts_stt_service.get_available_voices()
        
        return VoicesResponse(
            success=result["success"],
            voices=result["voices"],
            total_count=result["total_count"],
            error=result.get("error")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get voices: {str(e)}"
        )

@router.post("/pdf", response_model=PDFResponse)
async def create_pdf(
    request: PDFRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Create PDF from text"""
    
    try:
        pdf_bytes = await pdf_generator.text_to_pdf(request.text, request.title, request.author)
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        return PDFResponse(
            success=True,
            pdf_data=pdf_base64,
            title=request.title
        )
        
    except Exception as e:
        return PDFResponse(
            success=False,
            pdf_data="",
            title=request.title,
            error=str(e)
        )

@router.post("/pdf/sign", response_model=SignPDFResponse)
async def sign_pdf(
    request: SignPDFRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Add digital signature to PDF"""
    
    try:
        # Decode base64 PDF
        pdf_bytes = base64.b64decode(request.pdf_data)
        
        # Sign PDF
        signed_pdf_bytes = await pdf_generator.sign_pdf(
            pdf_bytes, request.signature_text, request.signatory_name
        )
        
        signed_pdf_base64 = base64.b64encode(signed_pdf_bytes).decode('utf-8')
        
        return SignPDFResponse(
            success=True,
            signed_pdf_data=signed_pdf_base64
        )
        
    except Exception as e:
        return SignPDFResponse(
            success=False,
            signed_pdf_data="",
            error=str(e)
        )
