import openai
from elevenlabs import API, Voice, VoiceSettings
import io
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
# import whisper  # Commented out due to installation issues
import tempfile
import base64

load_dotenv()

class TTS_STT_Service:
    def __init__(self):
        self.openai_client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY", "dummy-key-for-testing")
        )
        self.elevenlabs_client = API(
            api_key=os.getenv("ELEVENLABS_API_KEY", "dummy-key-for-testing")
        )
        # self.whisper_model = whisper.load_model("base")  # Commented out due to installation issues
        
        # Default voice settings
        self.voice_settings = VoiceSettings(
            stability=0.75,
            similarity_boost=0.75,
            style=0.0,
            use_speaker_boost=True
        )
    
    async def text_to_speech(self, text: str, voice_id: str = "Rachel") -> Dict[str, Any]:
        """
        Convert text to speech using ElevenLabs
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (default: Rachel)
            
        Returns:
            dict: Audio data and metadata
        """
        try:
            # Generate audio using ElevenLabs
            audio = self.elevenlabs_client.generate(
                text=text,
                voice=Voice(voice_id=voice_id, settings=self.voice_settings)
            )
            
            # Convert to bytes
            audio_bytes = b""
            for chunk in audio:
                audio_bytes += chunk
            
            # Encode to base64 for easy transmission
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return {
                "success": True,
                "audio_data": audio_base64,
                "format": "mp3",
                "voice_id": voice_id,
                "text_length": len(text),
                "duration_estimate": len(text.split()) * 0.8  # Rough estimate
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "audio_data": ""
            }
    
    async def speech_to_text(self, audio_data: bytes, language: str = "en") -> Dict[str, Any]:
        """
        Convert speech to text using Whisper
        
        Args:
            audio_data: Audio data in bytes
            language: Language code (default: en)
            
        Returns:
            dict: Transcribed text and metadata
        """
        try:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using Whisper (commented out due to installation issues)
                # result = self.whisper_model.transcribe(
                #     temp_file_path,
                #     language=language,
                #     fp16=False
                # )
                
                # Fallback to OpenAI Whisper API
                with open(temp_file_path, "rb") as audio_file:
                    transcript = self.openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=language
                    )
                
                transcription = transcript.text
                language_detected = language
                
                return {
                    "success": True,
                    "transcription": transcription.strip(),
                    "language_detected": language_detected,
                    "confidence": 0.95,
                    "duration": transcript.duration if hasattr(transcript, 'duration') else 0
                }
                
            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "transcription": ""
            }
    
    async def get_available_voices(self) -> Dict[str, Any]:
        """
        Get list of available voices from ElevenLabs
        
        Returns:
            dict: Available voices
        """
        try:
            voices = self.elevenlabs_client.voices.get_all()
            
            voice_list = []
            for voice in voices.voices:
                voice_list.append({
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category,
                    "description": voice.description,
                    "gender": getattr(voice, 'gender', 'unknown')
                })
            
            return {
                "success": True,
                "voices": voice_list,
                "total_count": len(voice_list)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "voices": []
            }
    
    async def openai_tts(self, text: str, voice: str = "alloy") -> Dict[str, Any]:
        """
        Fallback TTS using OpenAI
        
        Args:
            text: Text to convert
            voice: OpenAI voice (alloy, echo, fable, onyx, nova, shimmer)
            
        Returns:
            dict: Audio data and metadata
        """
        try:
            response = self.openai_client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text
            )
            
            # Get audio content
            audio_bytes = response.content
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            return {
                "success": True,
                "audio_data": audio_base64,
                "format": "mp3",
                "voice": voice,
                "provider": "OpenAI",
                "text_length": len(text)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "audio_data": ""
            }
    
    async def openai_stt(self, audio_data: bytes, language: str = "en") -> Dict[str, Any]:
        """
        Fallback STT using OpenAI Whisper API
        
        Args:
            audio_data: Audio data
            language: Language code
            
        Returns:
            dict: Transcription result
        """
        try:
            # Create a temporary file for the audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                with open(temp_file_path, "rb") as audio_file:
                    transcript = self.openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=language
                    )
                
                return {
                    "success": True,
                    "transcription": transcript.text,
                    "language": language,
                    "provider": "OpenAI"
                }
                
            finally:
                os.unlink(temp_file_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "transcription": ""
            }

# Global instance
tts_stt_service = TTS_STT_Service()
